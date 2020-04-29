import { LightningElement, api, track, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';

export default class JcvLookup extends LightningElement {


    @api recordId;
    @api objectApiName;
    @api disabled;
    @api required;
    @api apiName;
    @api value;
    @api validity = {};
    @api recordParent;
    @api time;

    disconnectedCallback()
    {
        this.recordParent = '';
        console.log('disconnectedCallback');
    }

    renderedCallback() {
        let element = this.getElement(this.apiName);
        if(element) {
            element.value = this.fieldValue;
        }
    }

    @wire(getRecordUi, { recordIds: '$recordParent', layoutTypes: 'Full', modes: 'Edit', dummy: '$time'})
    dcrRecordUi(response) {
        let error = response && response.error;
        let data = response && response.data;

        var flds;
        var myObj ={}; 

        if (data) {

            for (var record in data.records) {
               
                flds =data.records[record];
                
                myObj.fieldApiName = this.apiName;
                myObj.fields = flds;
                myObj.id = this.recordParent;

            }            
            const loadEvent = new CustomEvent('loaddata', {detail : myObj});
            this.dispatchEvent(loadEvent);
        } 
        else if (error) {
            console.log(error);
            alert(error);
        }
    }

    handleChange(event) {

        console.log('change event');
        console.log('fieldValue ' +  event.target.value);
        console.log('fieldApiName ' +   this.apiName);

        var obj = {};
        obj.fieldApiName = this.apiName;
        obj.id = '';
        obj.fields = {};
        obj.fields.fields ={};


        if(!event.target.value){
            const loadEvent = new CustomEvent('loaddata', {detail : obj});
            this.dispatchEvent(loadEvent);
        }

        this.recordParent = event.target.value;


    }
    getElement(fieldApiName) {
        // eslint-disable-next-line no-useless-concat
        let selector = '[data-fieldapiname='+"'"+fieldApiName+"'"+']';
        let element = this.template.querySelector(selector);
        return element;
    }

}