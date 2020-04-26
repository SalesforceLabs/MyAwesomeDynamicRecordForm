import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { getRecordUi } from 'lightning/uiRecordApi';
import { getRecordCreateDefaults } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import getRules from '@salesforce/apex/jcvRules.getRules';
import fetchRecordTypeValues from '@salesforce/apex/RecordTypeSelector.fetchRecordTypeValues';

export default class JcvNewRecordForm extends LightningElement {


    @track listRt=[];     //list of recordt types
    jsonRt={};

    @track recordTypeId = '';    //fields to store record type Id
    @track recordIdCopy;

    //fields boolen to control rendering
    @track cargado = false;      
    @track isLoading = false;
    hasRendered = true;
    bLoading = true;

    @api recordId;                  //  Id del registro obtenido desde el layout
    @api objectApiName;             //  Api name del objetoobtenido desde el layout


    @track infoSectionsLayout;      //structures to storage the form
    inputsInForm = new Map();
    sectionsInForm = new Map();
    @track formulario={};

    _response;

    //maps with data types 
    dataTypePicklists = new Map();
    dataTypeTexts = new Map();
    dataTypeDouble = new Map();
    dataTypeDate = new Map();
    dataTypeDatetime = new Map();
    dataTypeBoolean = new Map();
    dataTypePercent = new Map();
    dataTypeMultipicklist = new Map();
    dataTypeTextarea = new Map();
    dataTypeTime = new Map();
    dataTypeReference = new Map();
    dataTypeAllFields = new Map();
    dependences = new Map();
    dependent = new Map();

    rules;

     @wire(fetchRecordTypeValues, { objectName: '$objectApiName' })
     getRecordTypes({ data, error }) {
        if(!this.recordId){
            if(data){
                console.log(JSON.stringify(data));
                this.jsonRt = data;
                for(var rt in  data){
                    if(this.recordTypeId == '')
                    {
                        this.recordTypeId =rt;
                        this.getRtRules(data[rt]);
                    }
                    
                    console.log(rt);
                    console.log(data[rt]);

                    var option = {};
                    option.label = data[rt];
                    option.value = rt;
                    this.listRt.push(option);
                }
                if(this.recordTypeId == '')
                {
                    this.getRtRules('Master');
                }
                this.cargado = true;
            }else if(error){
                console.log('objectApiName es ' + this.objectApiName);
                console.log(JSON.stringify(error));
            }
        }
        else{
            console.log('estamos en modo edit');
        }

    }


    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objInfo({ data, error }) {
        if (data) {
            console.log('Inicializando getObjectInfo...');

            Object.values(data.fields).forEach((fld) => {
                let { apiName, dataType, length, precision, scale, calculated, label, updateable } = fld;
                let object = { apiName, dataType, length, precision, scale, calculated, label, updateable };
                //  Comprobamos el tipo de registro que se trata el campo
                if(fld.dataType === "String"){
                    this.dataTypeTexts.set(apiName, object);
                } else if(fld.dataType === "Picklist"){
                    this.dataTypePicklists.set(apiName, object);
                } else if(fld.dataType === "Double") {
                    this.dataTypeDouble.set(apiName, object);
                } else if(fld.dataType === "Date"){
                    this.dataTypeDate.set(apiName, object);
                } else if(fld.dataType === "Datetime"){
                    this.dataTypeDatetime.set(apiName, object);
                } else if(fld.dataType === "Time"){
                    this.dataTypeTime.set(apiName, object);
                } else if(fld.dataType === "Boolean") {
                    this.dataTypeBoolean.set(apiName, object);
                } else if(fld.dataType === "Percent") {
                    this.dataTypePercent.set(apiName, object);
                } else if(fld.dataType === "Multipicklist") {
                    this.dataTypeMultipicklist.set(apiName, object);
                } else if(fld.dataType === "TextArea") {
                    this.dataTypeTextarea.set(apiName, object);
                } else if(fld.dataType === "Reference") {
                    this.dataTypeReference.set(apiName, object);
                }

                this.dataTypeAllFields.set(apiName, object);
                
            });
            console.log('this.recordIdCopy = this.recordId');
                this.recordIdCopy = this.recordId;
                this.hasRendered = false;
            console.log('Finalizado getObjectInfo...');
        } else if(error) {;
            let msgError = 'Error mientras cargaba la información del objeto asociado';
            this.showToastEvent("ERROR", msgError, 'error', 'sticky'); 
        }
    }


    @wire(getRecordUi, { recordIds: '$recordIdCopy', layoutTypes: 'Full', modes: 'Edit'})
    dcrRecordUi(response) {
        var listLayout;
        var LayoutSection;
        var SectionList = [];
        var FieldList = [];
        this._response = response;
        let error = response && response.error;
        let data = response && response.data;

        

        if (data && this.hasRendered === false) {
            console.log('Inicializando dcRecordUi...');

            var record = data.records[this.recordId];

            if(this.recordTypeInfo)
            {
                this.recordTypeId = record.recordTypeId;
                console.log(this.recordTypeId);
                var rtName = this.jsonRt[this.recordTypeId];
                this.getRtRules(rtName);
            }
            else
            {
                console.log('getRtRules para master');
                this.getRtRules('Master');
            }


            listLayout = data.layouts[this.objectApiName][Object.keys(data.layouts[this.objectApiName])].Full.Edit.sections;
  
            this.sectionsInForm = {};
            for (let i = 0; i < listLayout.length; i++) {

                var count = 0;
  
                LayoutSection = {};
                FieldList = [];
                LayoutSection.id = listLayout[i].id;
                LayoutSection.heading = listLayout[i].heading;

                let section = listLayout[i].heading;
                this.sectionsInForm[section] = [];

                for (let j = 0; j < listLayout[i].layoutRows.length; j++) {
                    var boleanoColumnas = true;

                    for (let k = 0; k < listLayout[i].layoutRows[j].layoutItems.length; k++) {
                    
                       
                        var layoutItem = listLayout[i].layoutRows[j].layoutItems[k];
                        
                        for (let l = 0; l < layoutItem.layoutComponents.length; l++) {
                            var layoutComponent = layoutItem.layoutComponents[l];
                            var apiNamef = layoutComponent.apiName;
                            
                            let field = data.records[this.recordId].fields[apiNamef];
                            if(field){
                                var Field = {};
                                
                                Field = this.getField(layoutItem, layoutComponent);
                                Field.fieldValue = field.value;
                                this.formulario[apiNamef] ={"value": field.value, "seccion": i, "posicion":count};
                                Field[apiNamef]={"fieldValue": field.value};
                                count = count +1;
                                Field.boleanoColumnas =boleanoColumnas;
                                Field.key='0000'+i+j+k+l;
                                boleanoColumnas = !boleanoColumnas;
        
                                this.sectionsInForm[section].push(apiNamef);
                                FieldList.push(Field);

                            }

                        
                        }
                        

                    }

                }
                LayoutSection.lstFields = FieldList;
                SectionList.push(LayoutSection);
                    
            } 

            if (SectionList) {
                this.infoSectionsLayout = SectionList;
            }
            console.log('Finalizado dcRecordUi...');
        }
    
    }


    getField(layoutItem, layoutComponent){
        var Field = {};
        var apiNamef = layoutComponent.apiName;

        Field.apiName = apiNamef;
        Field.ts = Date.now();
        Field.isReadOnly = !layoutItem.editableForUpdate;
        Field.isRequired = layoutItem.required;

        Field.metadata = this.dataTypeAllFields.get(apiNamef);

        if(Field.metadata.dataType == 'Address'){
            Field.metadata.isAddress = true;
        }
        else if(Field.metadata.dataType == 'Base64')
            Field.metadata.isBase64 = true;
        else if(Field.metadata.dataType == 'Boolean')
            Field.metadata.isBoolean = true;
        else if(Field.metadata.dataType == 'ComboBox')
            Field.metadata.isComboBox = true;
        else if(Field.metadata.dataType == 'Currency')
            Field.metadata.isCurrency = true;
        else if(Field.metadata.dataType == 'Date')
            Field.metadata.isDate = true;
        else if(Field.metadata.dataType == 'DateTime')
            Field.metadata.isDateTime = true;
        else if(Field.metadata.dataType == 'Double')
            Field.metadata.isDouble = true;
        else if(Field.metadata.dataType == 'Email')
            Field.metadata.isEmail = true;
        else if(Field.metadata.dataType == 'Int')
            Field.metadata.isInt = true;
        else if(Field.metadata.dataType == 'Location')
            Field.metadata.isLocation = true;
        else if(Field.metadata.dataType == 'MultiPicklist')
            Field.metadata.isMultiPicklist = true;
        else if(Field.metadata.dataType == 'Percent')
            Field.metadata.isPercent = true;
        else if(Field.metadata.dataType == 'Phone')
            Field.metadata.isPhone = true;
        else if(Field.metadata.dataType == 'Picklist')
        {
            Field.metadata.isPicklist = true;
        }
        else if(Field.metadata.dataType == 'Reference')
        {
            Field.metadata.isReference = true;
        } 
        else if(Field.metadata.dataType == 'String')
            Field.metadata.isString = true;
        else if(Field.metadata.dataType == 'TextArea')
            Field.metadata.isTextArea = true;
        else if(Field.metadata.dataType == 'Time')
            Field.metadata.isTime = true;
        else if(Field.metadata.dataType == 'Url')
        {
            Field.metadata.isUrl = true;
        }

        Field.metadata.computedIsReadOnly = Field.isReadOnly;
        Field.metadata.computedIsRequired = Field.isRequired;

        return Field;


    }


    getRtRules(recordType) {
        console.log('dentro de getRtRules');
        getRules({objectName: this.objectApiName, recordTypeName: recordType})
            .then(result => {
                this.rules = result.data;
            })
            .catch(error => {
                this.error = error;
            });
    }

    get option() {
        return this.listRt;
    }
    get isList(){
        if(this.listRt.length > 0) 
            return true;
        else    
            return false;
    }

    handleChangeRt(event) {
        this.recordTypeId = event.detail.value;
        var rtName = this.jsonRt[this.recordTypeId];
        this.getRtRules(rtName);
    }







}