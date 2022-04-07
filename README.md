# zohofinance-Bitly-Invoice-Link

## Description

<p>This long URLs are annoying when you want to send notifications to your clients using SMS or email campaigns. As most SMS services limit the number of characters you can use.</p>

<p>In Zoho Books, the invoice share link is generated via the Share option which is prolonged, so it cannot be sent through SMS. Hence, by using Bitly, the invoice link is shortened and can be shared with customers.</p>

##### Components Used: :exclamation:

    Widgets - User Interface to select the link expiry date/view the generated link /copy the link.
    Custom Field - To store the latest bitly Link generated for that particular Invoice which can be used in email templates and sms templates
    Connections -  To update the Custom Fields in Zoho Books, To generate invoice share link from Bitly 



## Prerequest

<p>Custom Field and Conections(zohoBooks & Bitly) are the prerquest to run the plugin in development mode.</p>
<p>ZohoBooks connection Scopes:</p>

 ````
       ZohoBooks.invoices.UPDATE
       ZohoBooks.settings.All      
 ````
              
## Deployment Process
* Clone Repository 
* npm install (it will install the nodeModule to run the server)
* After installation use the command zet run (Its will run your app in https://localhost:5000)
* Enable Development Mode in zohoBooks
* use this pulgin (Bitly-Invoice-Link) in invoice.details.button
