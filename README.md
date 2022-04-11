# Bitly-Invoice-Link

## Description

<p>This long URLs are annoying when you want to send notifications to your clients using SMS or email campaigns. As most SMS services limit the number of characters you can use.</p>

<p>In Zoho Books, the invoice share link is generated via the Share option which is prolonged, so it cannot be sent through SMS. Hence, by using Bitly, the invoice link is shortened and can be shared with customers.</p>

##### Components Used: :exclamation:

    Widgets - User Interface to select the link expiry date/view the generated link /copy the link.
    Custom Field - To store the latest bitly Link generated for that particular Invoice which can be used in email templates and sms templates
    Connections -  To update the Custom Fields in Zoho Books, To generate invoice share link from Bitly 



## Prerequesties:

In this repository , we have a source code of widgets only.
This widget uses the custom fields and connections.
To make this widget work in Development mode, you need to create custom field and connections.
1. Create a url type custom field in invoice module and paste the field API name [here](https://github.com/zoho/zohofinance-Bitly-Invoice-Link/blob/be8ccca587de9fc64fbdeaad52dfb0b10af546cf/app/js/extension.js#L14)
2. Create a connections for books and bitly services as like mentioned in [plugin-manifest.json](https://github.com/zoho/zohofinance-Bitly-Invoice-Link/blob/be8ccca587de9fc64fbdeaad52dfb0b10af546cf/plugin-manifest.json#L18).   
              
## Development Process of Bitly Invoice Link Widget:
* Clone Repository
* Run `npm install` 
* Run `zet run` (To run your application in https://localhost:5000)
* Bitly-Invoice-Link

