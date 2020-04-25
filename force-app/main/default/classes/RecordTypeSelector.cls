public class RecordTypeSelector{

    /*

     * This function will fetch the RecordTypes of

     * provided object and will return a map of

     * recordTypeId and recordTypeNames

     * it excludes 'master' record type

     * */

    public static Map<Id, String> recordtypemap;

    @AuraEnabled(cacheable=true)
    public static Map<Id, String> fetchRecordTypeValues(String objectName){
        List<Schema.RecordTypeInfo> recordtypes = Schema.getGlobalDescribe().get(objectName).getDescribe().getRecordTypeInfos();    
        recordtypemap = new Map<Id, String>();
        for(RecordTypeInfo rt : recordtypes){
            if(rt.getName() != 'Master' && rt.getName().trim() != '')
            recordtypemap.put(rt.getRecordTypeId(), rt.getName());
        }        
        return recordtypemap;

    }

}