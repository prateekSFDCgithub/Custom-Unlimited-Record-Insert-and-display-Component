({
    addRow: function(component, event, helper) {
        var buttonS = component.find("buttonS");
        $A.util.removeClass(buttonS, "slds-hide");
        //get the account List from component  
        var remainderList = component.get("v.remainderList");
        //Add New Account Record
        remainderList.push({
            'sobjectType': 'Reminder__c',
            'Reminders_To_discuss__c': '',
            'Notes_from_Check_ins_Reporting__c': '',
            'Action_Items_Next_Steps__c': '',
            'EventId__c': component.get("v.recordId"),
            'Assigned_To__c': component.get("v.OwnerIdAt"),
            'Account__c' : component.get("v.WhatIdAt")
        });
        component.set("v.remainderList", remainderList);
        console.log('owneerid: ' + component.get("v.OwnerIdAt"));
        console.log('remainderLsit: ' + JSON.stringify(component.get("v.remainderList")));
    },
    
    removeRecord: function(component, event, helper) {
        //Get the account list
        var remainderList = component.get("v.remainderList");
        //Get the target object
        var selectedItem = event.currentTarget;
        //Get the selected item index
        var index = selectedItem.dataset.record;
        //Remove single record from account list
        remainderList.splice(index, 1);
        //Set modified account list
        component.set("v.remainderList", remainderList);
        var buttonS = component.find("buttonS");
        if (remainderList.length === 0) {
            $A.util.addClass(buttonS, "slds-hide");
        }
    },
    
    saveAccounts: function(component, event, helper) {  
        var isValid = true;
        var remainderList = component.get("v.remainderList");
        
        if (remainderList.length === 0) {
            isValid = false;
            alert('Add at least one row');
        } else {
            for (var i = 0; i < remainderList.length; i++) {
                // Check if the Reminders To Discuss field is 'choose_one01'
                if (remainderList[i].Reminders_To_discuss__c === 'choose_one01') {
                    isValid = false;
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error",
                        "message": "Reminder to discuss cannot be blank on SR. NO"  + (i + 1) + ".",
                        "type": "error"
                    });
                    toastEvent.fire();
                    break; 
                } else if (!remainderList[i].Reminders_To_discuss__c) {
                    isValid = false;
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": "Reminder to discuss cannot be blank on SR. NO"  + (i + 1) + ".",
                        "type": "error"
                    });
                    toastEvent.fire();
                    break;
                }
            }
        }
        
        if (isValid === true) {
            component.set("v.isRefreshing", true);
            // Call Apex method and pass account list as parameters
            var action = component.get("c.saveAccountList");
            action.setParams({
                "accList": remainderList
            });
            action.setCallback(this, function(response) {
                //get response status 
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set("v.isRefreshing", false);
                    component.set("v.remainderList", []);
                    var buttonS = component.find("buttonS");
                    $A.util.addClass(buttonS, "slds-hide");
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "message": "Records saved successfully.",
                        "type": "success"
                    });
                    toastEvent.fire();
                }
            }); 
            $A.enqueueAction(action);
            
            var actionn = component.get("c.querryRemainder");
            actionn.setParams({
                "recordids": component.get("v.recordId")
            });
            actionn.setCallback(this, function(response) {
                //get response status 
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set("v.returnedRemainderList", response.getReturnValue());
                }
            });
            $A.enqueueAction(actionn); 
        }
    },
    
    
    handleSave: function(component, event, helper) {
        component.set("v.isRefreshing", true);
        var draftValues = event.getParam('draftValues');
        var updatedRemainders = component.get('v.returnedRemainderList');
        // Call the Apex method to save the records
        var action = component.get("c.updateAccountList");
        action.setParams({
            "RemList": draftValues
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.isRefreshing", false);
                component.set('v.draftValues', []);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": "Records updated successfully.",
                    "type": "success"
                });
                toastEvent.fire();
            } else if (state === "ERROR") {
                // Handle errors
                var errors = response.getError();
                console.error(errors);
                component.set("v.isRefreshing", false);
                alert('An error occurred while saving the records.');
            }
        });
        var actionn = component.get("c.querryRemainder");
        actionn.setParams({"recordids": component.get("v.recordId")});
        actionn.setCallback(this, function(response) {
            component.set("v.returnedRemainderList", response.getReturnValue());
        });
        $A.enqueueAction(action);
        $A.enqueueAction(actionn);
    },
    
    handleRowAction: function(component, event, helper) {
        var action = event.getParam('action');
        switch (action.name) {
            case 'view':
                var recId = event.getParam('row').Id;
                var navService = component.find("navService");
                var PageReference = {
                    type : "standard__recordPage",
                    attributes: {
                        recordId: recId,
                        objectApiName: 'Reminder__c',
                        actionName: 'view'
                    }
                };
                component.set("v.PageReference", PageReference);
                const handleUrl = (url) => {
                    window.open(url, '_blank');
                };
                const handleError = (error) => {
                    console.log(error);
                }
                navService.generateUrl(PageReference).then(handleUrl, handleError);
                break;
            case 'delete':
                component.set("v.isRefreshing", true);
                var recId = event.getParam('row').Id;
                var action = component.get("c.deleteReminder");
                action.setParams({"recordIds": [recId], "eventId": component.get("v.recordId")});
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        component.set("v.isRefreshing", false);
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "title": "Success!",
                            "message": "Records deleted successfully.",
                            "type": "success"
                        });
                        toastEvent.fire();
                        component.set("v.returnedRemainderList", response.getReturnValue());
                    }
                });   
                $A.enqueueAction(action);     
                break;
            case 'Edit':
                component.set("v.bShowModal", true);
                component.set("v.isRefreshing", true);
                var recId = event.getParam('row').Id;
                var action2 = component.get("c.querryRemainder2");
                action2.setParams({"recordids": [recId]});
                console.log('recId :' + recId);
                component.set("v.reminderId", recId);
                action2.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        // Access the first record in the response (assuming there's only one)
                        var records = response.getReturnValue();
                        if (records.length > 0) {
                            var record = records[0];
                            console.log('reimderDiscus : ' + component.get("v.Reminders_To_discuss__c"));
                            
                            component.set("v.Reminders_To_discuss__c", record.Reminders_To_discuss__c);
                            component.set("v.ReminderName", record.Name);
                            console.log('Name : ' + component.get("v.ReminderName"));
                            component.set("v.Action_Items_Next_Steps__c", record.Action_Items_Next_Steps__c);
                            component.set("v.Notes_from_Check_ins_Reporting__c", record.Notes_from_Check_ins_Reporting__c);
                            // Set other attributes as needed
                        }
                        component.set("v.isRefreshing", false);
                    }
                });
                $A.enqueueAction(action2);
                break;
        }
    },
    handleSort: function(component, event, helper) {
        var sortBy = event.getParam("fieldName");
        var sortDirection = event.getParam("sortDirection");
        component.set("v.sortBy", sortBy);
        component.set("v.sortDirection", sortDirection);
        helper.sortData(component, sortBy, sortDirection);
    },
    
    doInit: function(component, event, helper) {
        var act = component.get("c.returnAssignedTo");
        act.setParams({
            "EventId": component.get("v.recordId")
        });
        act.setCallback(this, function(response) {
            var state = response.getState();
            console.log('response 254 : ' + response.getReturnValue());
            if (state === "SUCCESS") {
                var eventMap = response.getReturnValue();
                console.log('fullmap :' + eventMap)
                component.set('v.OwnerIdAt', eventMap['ownerId']);
                component.set('v.WhatIdAt', eventMap['whatId']);
                console.log('OwnerIdAt 246@: ' + eventMap['ownerId']);
                console.log('WhatIdAt 247@: ' + eventMap['whatId']);
                
                var remainderList = component.get("v.remainderList");
                 remainderList.push({
            'sobjectType': 'Reminder__c',
            'Reminders_To_discuss__c': '',
            'Notes_from_Check_ins_Reporting__c': '',
            'Action_Items_Next_Steps__c': '',
            'EventId__c': component.get("v.recordId"),
            'Assigned_To__c': component.get("v.OwnerIdAt"),
                     'Account__c':component.get("v.WhatIdAt")
        });
                component.set("v.remainderList", remainderList);
            }
        });
        $A.enqueueAction(act);
        
        var action = component.get("c.querryRemainder");
        action.setParams({
            "recordids": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.returnedRemainderList', response.getReturnValue());                                          
            }
        });
        $A.enqueueAction(action);
        var actionn = component.get("c.getReminderToDiscussPicklistValues");
        actionn.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.reminderToDiscussPicklistOptions", response.getReturnValue());
            }
        });
        $A.enqueueAction(actionn);
        const actions = [{label:'view', name:'view' },{label:'Delete', name:'delete'},{label:'Edit', name:'Edit'}];
        component.set('v.columns', [
            {label: 'Reminders Name', fieldName: 'Name', type: 'text', sortable: true, editable: false},
            {label: 'Reminders To Discuss', fieldName: 'Reminders_To_discuss__c', type: 'picklist', sortable: true, editable: false,
             typeAttributes: {
                 placeholder: 'Choose one...',
                 options: [
                     {label: 'General', value: 'General' },
                     {label: 'Monthly Report Reminder', value: 'Monthly Report Reminder' },
                     // Add more options as needed
                 ]
             }
            },
            {label: 'Action Items / Next Steps', fieldName: 'Action_Items_Next_Steps__c', type: 'text', sortable:true, editable: false },
            {label: 'Notes from Check-ins / Reporting', fieldName: 'Notes_from_Check_ins_Reporting__c', sortable:true, type: 'text', editable: false },
            {type: 'action', typeAttributes: {rowActions: actions}}
        ]);
    },
    refreshData: function(component, event, helper) {
        var refreshButton = component.find("refreshButton");
        var datatableContainer = component.find("datatableContainer");
        var spinnerContainer = component.find("spinnerContainer");
        component.set("v.isRefreshing", true);
        $A.util.addClass(datatableContainer, "slds-hide");
        var action = component.get("c.querryRemainder");
        action.setParams({
            "recordids": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.returnedRemainderList", response.getReturnValue());
            }
            component.set("v.isRefreshing", false);
            $A.util.removeClass(datatableContainer, "slds-hide");
        });
        $A.enqueueAction(action);
    },
    closeModal: function(component, event, helper) {
        component.set("v.bShowModal", false);
    },
    handleModalChange: function(component, event, helper) {
        console.log('Event: ' + event);
        const fieldName = event.getSource().getLocalId();
        const value = event.getParam("value");
        console.log('value:@' + value);
        console.log('fieldName : ' + fieldName);
        if (fieldName === 'Reminders_To_discuss__c') {
            console.log('ReminderToDiscuss@@ :' + value);
            component.set("v.Reminders_To_discuss__c_Updated", event.getSource().get("v.value"));
            console.log('REminderToDiscussUpdated@@ :' + component.get("v.Reminders_To_discuss__c_Updated"));
        } else if (fieldName === 'Action_Items_Next_Steps__c') {
            console.log('Action@@ :' + event.target.value);
            component.set("v.Action_Items_Next_Steps__c_Updated", value);
            console.log('ActionUpdated@@ :' + component.get("v.Action_Items_Next_Steps__c_Updated"));
        } else if (fieldName === 'Notes_from_Check_ins_Reporting__c') {
            component.set("v.Notes_from_Check_ins_Reporting__c_Updated", value);
            console.log('NotesUpdated@@ :' + component.get("v.Notes_from_Check_ins_Reporting__c_Updated"));
            console.log('notesold'+ component.get("v.Notes_from_Check_ins_Reporting__c"));
        }
    },
    handleSubmit: function(component, event, helper) {
        component.set("v.isRefreshing", true);
        var action = component.get("c.UpdateReminders");
        action.setParams({
            "reminderId": component.get("v.reminderId"),
            "Reminders_To_discuss": (component.get("v.Reminders_To_discuss__c_Updated") == null && component.get("v.Reminders_To_discuss__c_Updated") == '') ? 
                                     component.get("v.Reminders_To_discuss__c_Updated") : 
                                     component.get("v.Reminders_To_discuss__c"),
            "Action_Items_Next_Steps": (component.get("v.Action_Items_Next_Steps__c_Updated") == null && component.get("v.Action_Items_Next_Steps__c_Updated") == '') ? 
                                         component.get("v.Action_Items_Next_Steps__c_Updated") : 
                                         component.get("v.Action_Items_Next_Steps__c"),
            "Notes_from_Check_ins_Reporting": (component.get("v.Notes_from_Check_ins_Reporting__c_Updated") == null && component.get("v.Notes_from_Check_ins_Reporting__c_Updated") == '') ? 
                                                component.get("v.Notes_from_Check_ins_Reporting__c_Updated") : 
                                                component.get("v.Notes_from_Check_ins_Reporting__c"),
            "assignedTo": component.get("v.OwnerIdAt")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": "Records Updated successfully.",
                    "type": "success"
                });
                toastEvent.fire();
                component.set("v.isRefreshing", false);
                component.set("v.bShowModal", false);
            }
        });
        $A.enqueueAction(action); 
        component.set("v.isRefreshing", true);
        var actionn = component.get("c.querryRemainder");
        actionn.setParams({
            "recordids": component.get("v.recordId")
        });
        actionn.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.returnedRemainderList', response.getReturnValue()); 
                component.set("v.isRefreshing", false);
            }
        });
        $A.enqueueAction(actionn);
    }
})