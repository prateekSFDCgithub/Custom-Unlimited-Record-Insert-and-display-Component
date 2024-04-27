public without sharing class AuraController {
@AuraEnabled
    public static void saveAccountList(List<Reminder__c> accList) { 
       
        Insert accList;
    }
    @AuraEnabled
    public static void updateAccountList(List<Reminder__c> RemList) {        
           system.debug(remlist+'@@@@@');
        update RemList;
     

    }
    @AuraEnabled
    public static list<Reminder__c> querryRemainder(List<id> recordids){
        system.debug('rrr: '+recordids );
        
        return [select id,eventid__c,Notes_from_Check_ins_Reporting__c,
                Reminders_To_discuss__c,Action_Items_Next_Steps__c ,name
                from Reminder__c where eventid__c in:recordids];
    }
    @AuraEnabled
    public static list<Reminder__c> querryRemainder2(List<id> recordids){
        system.debug('rrr: '+recordids );
        system.debug([select id,eventid__c,Notes_from_Check_ins_Reporting__c,
                Reminders_To_discuss__c,Action_Items_Next_Steps__c ,name
                from Reminder__c where id in:recordids]);
        
        return [select id,eventid__c,Notes_from_Check_ins_Reporting__c,
                Reminders_To_discuss__c,Action_Items_Next_Steps__c ,Name
                from Reminder__c where id in:recordids];
    }
    @AuraEnabled
    public static list<reminder__c> deleteReminder(List<id> recordIds,list<id>eventId){
        system.debug(recordids+'  @@@  '+ eventId);
        delete[select id from reminder__c where id in:recordIds];
           return [select id,eventid__c,Notes_from_Check_ins_Reporting__c,
                Reminders_To_discuss__c,Action_Items_Next_Steps__c ,Name
                from Reminder__c where eventid__c in:eventId];
    }
      @AuraEnabled(cacheable=true)
    public static List<String> getReminderToDiscussPicklistValues() {
       
        List<String> picklistValues = new List<String>();
        Schema.DescribeFieldResult fieldResult = Reminder__c.Reminders_to_discuss__c.getDescribe();
        
        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
            picklistValues.add(entry.getLabel());
        }
        
        return picklistValues;
    }
     @AuraEnabled
    public static void UpdateReminders(string reminderId, string Reminders_To_discuss, string Action_Items_Next_Steps,string Notes_from_Check_ins_Reporting, id assignedTo) {        
          list<Reminder__c>reminderList = [select id,Reminders_To_discuss__c,Action_Items_Next_Steps__c,Notes_from_Check_ins_Reporting__c,Assigned_To__c from reminder__c where id =:reminderId];
        list<Reminder__c>reminderListUpdated = new list<reminder__c>();
        for(Reminder__c rem:reminderList){
            rem.Reminders_To_discuss__c = Reminders_To_discuss;
            rem.Action_Items_Next_Steps__c = Action_Items_Next_Steps;
            rem.Notes_from_Check_ins_Reporting__c = Notes_from_Check_ins_Reporting;
            rem.Assigned_To__c =assignedTo;
            reminderListUpdated.add(rem);
        }
     update reminderListUpdated;

    }
    @AuraEnabled
    public static Map<String, String> returnAssignedTo(Id EventId){
    Map<String, String> eventMap = new Map<String, String>();
    List<Event> eventList = [SELECT Id, OwnerId, WhatId FROM Event WHERE Id = :EventId];
    
    for (Event ev : eventList) {
        eventMap.put('whatId', ev.WhatId);
        eventMap.put('ownerId', ev.OwnerId);
    }
    
    return eventMap;
}
    }