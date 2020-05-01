@isTest
public  class TestRulesController {


        @isTest
        static void getRule() {

            Test.startTest();
            
            String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
            // This code runs as the system user
            Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
            User u = new User(Alias = 'standt', Email='standarduser@testorg.com',
                                EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US',
                                LocaleSidKey='en_US', ProfileId = p.Id,
                                TimeZoneSidKey='America/Los_Angeles',
                                UserName=uniqueUserName);

            System.runAs(u) {
                    String [] rules = new List<String>();
            
                    
                    rules= jcvRules.getRules('Dummy', 'Dummy');
                    Test.stopTest();
            
                    System.assertEquals(rules[0], 'DummyTest');
                }
            }

}
