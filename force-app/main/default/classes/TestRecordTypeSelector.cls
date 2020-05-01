@isTest
public  class TestRecordTypeSelector {


    @isTest
    static void getRecordTypes() {
        Test.startTest();
        Map<Id, String> recordtypemap = new Map<Id, String>();
        recordtypemap = RecordTypeSelector.fetchRecordTypeValues('jcvExample__c');

        List<String> names = new List<String>();
        names = recordtypemap.values();

        Test.stopTest();
        System.assertEquals(names[0], 'Dummy');
        
    }
    


}
