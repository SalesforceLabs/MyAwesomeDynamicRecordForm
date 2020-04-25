import { LightningElement, wire } from 'lwc';
import getRules from '@salesforce/apex/jcvRules.getRules';

export default class JcvRecordEditForm extends LightningElement {
    
    @wire(getRules, {objectName: 'Contact', recordTypeName: 'Master'}) rules;
}