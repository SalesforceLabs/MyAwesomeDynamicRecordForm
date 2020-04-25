({
	closeQA : function(component, event, helper) {
		$A.get("e.force:closeQuickAction").fire();
    },
    handleNewObject: function(component, event, helper) {
        var id = event.getParam('objectId');
        
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": id
        });
        
        navEvt.fire();



    }
})