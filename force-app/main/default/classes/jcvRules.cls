public with sharing class jcvRules {

    @AuraEnabled(cacheable=true)
    public static string getRules(String objectName, String recordTypeName) {

        Id profileId=userinfo.getProfileId();
        String rules='';
        String profileName=[Select Id,Name from Profile where Id=:profileId].Name;

        List<jcvRules__mdt> ruleList  = [select id, jsonRules__c from jcvRules__mdt where objectName__c =: objectName AND profileName__c =: profileName 
                     and recordTypeName__c =:recordTypeName limit 1] ;
        
        if(!ruleList.isEmpty())
            rules = ruleList[0].jsonRules__c;
        else
        {
            ruleList  = [select id, jsonRules__c from jcvRules__mdt where objectName__c =: objectName AND profileName__c = '*'
                     and recordTypeName__c =:recordTypeName limit 1] ;
            
            if(!ruleList.isEmpty())
                rules = ruleList[0].jsonRules__c;
        }

        return rules;


    }
}
