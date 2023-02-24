// Note: DELETE ALL RECORDS FROM THE OPTIMOROUTE_IMPORT TABLE BEFORE PROCEEDING.

let subscribersTable = base.getTable("Subscribers");
let subscribersView = subscribersTable.getView("Grid view");

let subscriptionsTable = base.getTable("Subscriptions");
let subscriptionsView = subscriptionsTable.getView("Grid view");

let deliveryCalendarTable = base.getTable("Delivery Calendar");
let deliveryCalendarView = deliveryCalendarTable.getView("Grid view");

let subscriberResults = await subscribersView.selectRecordsAsync({fields: ['Name', 'Route', 'Segment']});
let subscriptionsResults = await subscriptionsView.selectRecordsAsync({fields: ['Subscribers','Frequency (in weeks)']});
let deliveryCalendarResults = await deliveryCalendarView.selectRecordsAsync({fields: ['Delivery Weekend', 'Subscribers (from Subscriptions)', 'Subscriptions']});

let optimorouteImportTable = base.getTable("Optimoroute Import");

let deliveryDates = [new Date("April 11, 2023"),
                     new Date("April 12, 2023"),
                     new Date("April 13, 2023"),
                     new Date("April 14, 2023"),
                     new Date("April 18, 2023"),
                     new Date("April 19, 2023"),
                     new Date("April 20, 2023"),
                     new Date("April 21, 2023")];
let driver = "Matthew Nunnally";


// For each delivery date
// Grab a list of all the subscribers
// For each subscriber
// Grab the phone number, email, address, and the current delivery date, and add them to the OI table

for(let deliveryDate of deliveryDates){

    for(let deliveryRecord of deliveryCalendarResults.records){
        if(deliveryRecord.getCellValueAsString("Delivery Weekend") ==
            deliveryDate.toLocaleDateString('en-us', {year:"numeric", month:"long", day:"numeric"})){
                
                let subscribers = deliveryRecord.getCellValue("Subscribers (from Subscriptions)");
                let subscriberIdSet = new Set();
                
                // Add the IDs to a set, because there will be multiple entries for the same
                // subscriber on a given delivery date
                for(let subscriber of subscribers){
                    subscriberIdSet.add(subscriber.id);
                }

                for(let subscriberId of subscriberIdSet){
                    let subscriberDetails = await subscribersView.selectRecordAsync(subscriberId);
                    if(subscriberDetails && subscriberDetails.getCellValueAsString("Reserved") == "Yes"){
                        let newDeliveryID = await optimorouteImportTable.createRecordAsync({
                            "Customer": subscriberDetails.getCellValueAsString("Name"),
                            "Address": subscriberDetails.getCellValueAsString("Delivery Address"),
                            "Assigned to Driver": driver,
                            "Email": subscriberDetails.getCellValueAsString("Email"),
                            "Phone": subscriberDetails.getCellValueAsString("Cell Phone"),
                            "Date": deliveryDate,
                            "Duration": 2
                        });

                    }
                }
                
            }
    }
}
