'use strict';

const reader = require('order-reader');

const dictionaryData = {
  'OrderOwner': {
    'fields': {
      'request_no': 'Request # :',
      'email_time': 'Email Date Time:',
      'priority': 'Priority:',
      'project': 'Project:',
      'analyst': 'Analyst:',
      'status': 'Status:',
      'requestor': 'Requestor:',
      'phone': 'Phone:',
      'submitted': 'Submitted:',
      'requested_due': 'Requested Due:',
      'confirmed_due': 'Confirmed Due:',
      'agency_control': 'Agency Control:',
      'agency': 'Agency:',
      'order_type': 'Order Type:',
      'cost_center': 'Cost Center:',
      'request_description': 'Request Description:',
      'location_description': 'Location Description:',
    },
  },
  'Order': {
    'fields': {
      'request_no': 'Request #:',
      'action': 'Action:',
      'inventory_no': 'Inventory #:',
      'previous_inventory_no': 'Previous Inventory #:',
      'user_name': 'User Name:',
      'cost_center': 'Cost Center:',
      'cost_center_description': 'Cost Center Description:',
      'vendor': 'Vendor:',
      'service': 'Service:',
      'sr_no': 'SR #:',
      'sr_description': 'SR Description:',
      'comments': 'Comments:',
      'requested_due_date': 'Requested Due Date:',
      'billing_account_no': 'BILLING ACCOUNT #:',
      'equipment_model_no': 'EQUIPMENT MODEL #:',
    },
    'fields_by_header': {
      'Confirmed Due Date:': {
        'type': 'field_followed_by_table',
        'field_name': 'confirmed_due_date',
        'table_name': 'line_items',
        'num_columns': 7,
      },
      'Primary Location': {
        'type': 'primary_secondary_location',
        'location_field': 'primary_secondary_location',
        'contacts_field': 'contacts',
      },
    },
    'belongs_to': {
      'as': 'orders',
      'match_on': 'request_no',
    },
  },
};

const parser = new reader.OrderParser(dictionaryData);

module.exports = function(Originalfileobject) {
  Originalfileobject.beforeRemote('create', function(context, original_fileobject, next) {
    context.args.data.idkey = new Date().getTime();
    next();
  });

  Originalfileobject.afterRemote('create', function(context, original_fileobject, next) {
    parser.parse(original_fileobject.contents)
        .then(result => {
          Originalfileobject.app.models.converted_fileobject.create({
            contents: JSON.stringify(result),
            status: '',
            status_date_change: Date.now(),
            dictionary_version: '',
            dictionary_approval: '',
            idkey: original_fileobject.idkey,
          }, (err, converted_object) => {
            context.result = {
              result: result,
              original_fileobject_id: original_fileobject.id,
              converted_fileobject_id: converted_object.id,
              original_fileobject: original_fileobject
            };
            next();
          });
        })
        .catch(e => {
          console.log('error:', e);
          next();
        });
  });
};
