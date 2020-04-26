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