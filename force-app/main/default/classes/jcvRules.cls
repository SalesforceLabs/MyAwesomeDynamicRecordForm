public with sharing class jcvRules {

    @AuraEnabled(cacheable=true)
    public static string[] getRules(String objectName, String recordTypeName) {

        Id profileId=userinfo.getProfileId();
        String [] rules = new List<String>();

        String profileName=[Select Id,Name from Profile where Id=:profileId].Name;

        List<jcvRules__mdt> ruleList  = [select id, jsonRules__c from jcvRules__mdt where objectName__c =: objectName AND profileName__c =: profileName 
                     and recordTypeName__c =:recordTypeName limit 1] ;
        
        if(!ruleList.isEmpty())
        {
            rules.add(ruleList[0].jsonRules__c);
            rules.add(ruleList[0].jcvConfiguration__c);
        }
        else
        {
            ruleList  = [select id, jsonRules__c, jcvConfiguration__c from jcvRules__mdt where objectName__c =: objectName AND profileName__c = '*'
                     and recordTypeName__c =:recordTypeName limit 1] ;
            
            if(!ruleList.isEmpty())
            {
                rules.add(ruleList[0].jsonRules__c);
                rules.add(ruleList[0].jcvConfiguration__c);
            }  

        }

        return rules;


    }
}
