#  Awesome Dynamic Form
The Awesome Dynamic Form is designed to be a generic record form with interactive capabilities. You can define a parametrization for a combination of object/recordType/Profine with:
  - Non object fields: Aditional auxiliar custom fields to support somo funcionalities
  - Action, condition events to improve fomr's user interactivity

This is done in the custom metadata type **jcvRule**:
| Field Label | API Name | Data Type |	
| ------ | ------ |  ------ | 
| jcvConfiguration |jcvConfiguration__c|  	Long Text Area(32768)	 | 
| jsonRules |jsonRules__c|  	Long Text Area(32768)	 | 
| objectName |objectNamen__c|  	Text(255)	 | 
|profileName |profileName__c|  	Text(255)	 | 
| recordTypeName |recordTypeName__c|  	Text(255)	 | 
 
 If a rule applies to all the profiles you can set the profile to *. 
 (Currently there are no validation in the json format or salesforce's references so be carefull)
 
### jcvConfiguration
In this json you can add aditional field to your form to after create a interaction. The json is an array of fields. 
```javascript
{
  "fields": [...]
}
```
Currently there are 3 types of fields supported. You can add any of them to the array:
**Toogle:**
```javascript
{
  "fields": [
    {
      "field4": {
        "fieldValue": false
      },
      "apiName": "field4",
      "label": "Compact mode",
      "isToogle": true,
      "fieldValue": false
    }
  ]
}
```
**Combo:**
```javascript
{
  "fields": [
    {
      "field2": {
        "fieldValue": "Compact"
      },
      "apiName": "field2",
      "fieldValue": "Compact",
      "label": "Formato",
      "isCombo": true,
      "values": [
        {
          "label": "Compact",
          "value": "Compact"
        },
        {
          "label": "Full",
          "value": "Full"
        }
      ]
    }
  ]
}
```
**Radio:**
```javascript
{
  "fields": [
    {
      "field1": {
        "fieldValue": "Compact"
      },
      "apiName": "field1",
      "fieldValue": "Compact",
      "label": "Formato",
      "isRadio": true,
      "type": " button",
      "values": [
        {
          "label": "Compact",
          "value": "Compact"
        },
        {
          "label": "Full",
          "value": "Full"
        }
      ]
    }
  ]
}
```
### jcvRules
This is where the magic happens. For each field in the form (real from the object or created in the jcvConfiguration.json) you  define an array of actions which can occur where the field change his value. Each action is compound by
  - An array of Conditions
  - Logic of evaluation of conditions (AND or OR)
  - An array of Events. The possible events are
    - Set the field value
    - Set a field read only
    - Set a field mandatory
    - Hide a fiels

For example, imagine this requerement; in a contact record form, when you select the 
the account to which it belongs, if the fax field of the contact is empty, the fax field of the acount had to be auto completed with the Account's fax. You can define this behabier with this json file:
  
```javascript
{
  "AccountId": {
    "actions": [
      {
        "conditions": [
          {
            "method": "isNotNull",
            "params": [
              {
                "name": "AccountId.Fax",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "Fax",
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "Fax",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "AccountId.Fax"
            }
          }
        ]
      }
    ]
  }
}
```
Le's analize it by parts:
  - The trigger field is the Account
```javascript
 "AccountId": {
```
  - When the account's Fax is not null (**Important!: is it possible to have access to the account's fields**)
```javascript
    "actions": [
      {
        "conditions": [
          {
            "method": "isNotNull",
            "params": [
              {
                "name": "AccountId.Fax",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
```
  - We want to modify the Fax field of the contact is it's null
```javascript
"events": [
          {
            "field": "Fax",
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "Fax",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
```
  - and set the value to the Account's Fax value
```javascript
              "ValueType": "field",
              "field": "AccountId.Fax"
```
Some examples of events are:
 - **Hide a field**
```javascript
 "events": [
          {
            "field": "OtherStreet",
            "hide": {
              "conditions": [
                {
                  "method": "isTrue",
                  "params": [
                    {
                      "name": "isCompact",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            }
          }
        ]
```
 - **Set read only**
```javascript
 "events": [
          {
            "field": "OtherCountry",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          }
        ]
```
 - **Set required**
```javascript
"events": [
          {
            "field": "Phone",
            "required": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          }
        ]
```

The Awesome Dynamic Form will read this json and:
  - Dinamicaly execute the methods defined using a js class (**JcvValidatorClass**). The currently available methods are:
    - Is great (isGreat, 2 params)
    - Is equal (isEqual, 2 params)
    - Is low (isLow, 2 params)
    - Is Null (isNull, 1 param)
    - Is Not Null (isNotNull, 1 param)
    - Allways (getTrue, no param)
    - Never (getFalse, no param)
    - Is True (isTrue, 1 param)
    - Is False (isFalse, 1 param)
  **If you need to evaluate another condition (for example, the difference between two number is less than X, the only thing to do is add this methos in jcvValidatorClas.js and reference it in jcvRules.json**
 - Dinamicaly read the field values including the ones in the related objects (only one level), for example, AccountId.Fax

The Awesome Dynamic Form uses some @salesforce Modules and base componets to be object independent :
 - lightning/uiObjectInfoApi
 - lightning/uiRecordApi
    - getRecordUi
    - createRecord
    - updateRecord
 - Record Edit Form



It's possible tho created sophisticated behaviors, like this: the fields in address fields (City, State,...) had to be completed in order and you can choose to auto fill the OtherAddress with the Address values:
### Configuration
```javascript
{
  "fields": [
    {
      "isEqualAddress": {
        "fieldValue": false
      },
      "apiName": "isEqualAddress",
      "label": "Direcciones Iguales",
      "isToogle": true,
      "fieldValue": false
    }
  ]
}
```
### Rules
```javascript
{
  "MailingStreet": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "MailingCity",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingStreet",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingStreet",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          },
          {
            "field": "OtherStreet",
            "value": {
              "conditions": [
                {
                  "method": "isTrue",
                  "params": [
                    {
                      "name": "isEqualAddress",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingStreet"
            }
          }
        ]
      }
    ]
  },
  "MailingCity": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "MailingState",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingCity",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingCity",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          },
          {
            "field": "OtherCity",
            "value": {
              "conditions": [
                {
                  "method": "isTrue",
                  "params": [
                    {
                      "name": "isEqualAddress",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingCity"
            }
          }
        ]
      }
    ]
  },
  "MailingState": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "MailingPostalCode",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingState",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingState",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          },
          {
            "field": "OtherState",
            "value": {
              "conditions": [
                {
                  "method": "isTrue",
                  "params": [
                    {
                      "name": "isEqualAddress",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingState"
            }
          }
        ]
      }
    ]
  },
  "MailingPostalCode": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "MailingCountry",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingPostalCode",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "MailingPostalCode",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          },
          {
            "field": "OtherPostalCode",
            "value": {
              "conditions": [
                {
                  "method": "isTrue",
                  "params": [
                    {
                      "name": "isEqualAddress",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingPostalCode"
            }
          }
        ]
      }
    ]
  },
  "MailingCountry": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherCountry",
            "value": {
              "conditions": [
                {
                  "method": "isTrue",
                  "params": [
                    {
                      "name": "isEqualAddress",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingCountry"
            }
          }
        ]
      }
    ]
  },
  "isEqualAddress": {
    "actions": [
      {
        "conditions": [
          {
            "method": "isTrue",
            "params": [
              {
                "name": "isEqualAddress",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherStreet",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingStreet"
            }
          },
          {
            "field": "OtherCity",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingCity"
            }
          },
          {
            "field": "OtherState",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingState"
            }
          },
          {
            "field": "OtherPostalCode",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingPostalCode"
            }
          },
          {
            "field": "OtherCountry",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND",
              "ValueType": "field",
              "field": "MailingCountry"
            }
          }
        ]
      },
      {
        "conditions": [
          {
            "method": "isFalse",
            "params": [
              {
                "name": "isEqualAddress",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherStreet",
            "readonly": {
              "conditions": [
                {
                  "method": "getFalse",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          },
          {
            "field": "OtherCity",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherStreet",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            }
          },
          {
            "field": "OtherState",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherCity",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            }
          },
          {
            "field": "OtherPostalCode",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherState",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            }
          },
          {
            "field": "OtherCountry",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherPostalCode",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            }
          }
        ]
      }
    ]
  },
  "OtherStreet": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherCity",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherStreet",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherStreet",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          }
        ]
      },
      {
        "conditions": [
          {
            "method": "isTrue",
            "params": [
              {
                "name": "isEqualAddress",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherCity",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          }
        ]
      }
    ]
  },
  "OtherCity": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherState",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherCity",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherCity",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          }
        ]
      },
      {
        "conditions": [
          {
            "method": "isTrue",
            "params": [
              {
                "name": "isEqualAddress",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherState",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          }
        ]
      }
    ]
  },
  "OtherState": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherPostalCode",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherState",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherState",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          }
        ]
      },
      {
        "conditions": [
          {
            "method": "isTrue",
            "params": [
              {
                "name": "isEqualAddress",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherPostalCode",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          }
        ]
      }
    ]
  },
  "OtherPostalCode": {
    "actions": [
      {
        "conditions": [
          {
            "method": "getTrue",
            "params": []
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherCountry",
            "readonly": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherPostalCode",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND"
            },
            "value": {
              "conditions": [
                {
                  "method": "isNull",
                  "params": [
                    {
                      "name": "OtherPostalCode",
                      "type": "field"
                    }
                  ]
                }
              ],
              "logic": "AND",
              "ValueType": "value",
              "value": ""
            }
          }
        ]
      },
      {
        "conditions": [
          {
            "method": "isTrue",
            "params": [
              {
                "name": "isEqualAddress",
                "type": "field"
              }
            ]
          }
        ],
        "logic": "AND",
        "events": [
          {
            "field": "OtherCountry",
            "readonly": {
              "conditions": [
                {
                  "method": "getTrue",
                  "params": []
                }
              ],
              "logic": "AND"
            }
          }
        ]
      }
    ]
  }
}
```
### Todos
 - More Test
 - Write  Tests
 - Json validations
 - Json generation tools

License
----

MIT