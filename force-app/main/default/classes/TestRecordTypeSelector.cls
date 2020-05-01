@isTest
public  class TestRecordTypeSelector {


    @isTest
    static void getRecordTypes() {
        Test.startTest();
        Map<Id, String> recordtypemap = new Map<Id, String>();
        recordtypemap = RecordTypeSelector.fetchRecordTypeValues('Contact');
        Test.stopTest();
    }
    


}
