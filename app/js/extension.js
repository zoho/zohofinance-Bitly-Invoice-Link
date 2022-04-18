window.onload=function(){
    ZFAPPS.extension.init().then( async() => {
        ZFAPPS.invoke('RESIZE', { width: '526px', height: '318px' });

        // Data

        let { organization } = await ZFAPPS.get('organization');
        let { invoice } = await ZFAPPS.get('invoice');
      

        // Config

        const fieldName = 'cf__u0q6k_bitly_invoice_link';
        const booksConnection = 'zohobooksbitly';
        const bitlyConnection = 'zbbitly';
        const booksAPIPrefix = `https://books.zoho${ organization.data_center_extension || '.com' }/api/v3`;
        const linkType = 'public';
       

        // Elements

        const popup = document.querySelector('.jsHTML');
        const generate = document.querySelector('#generate');
        const Link = document.querySelector('#Link');
        const regenerate = document.querySelector('#regenerate');
        const bitly = document.querySelector('#bitly');
        const dialog = document.querySelector('#dialog');
        const confirm = document.querySelector('#dialog-confirm');
        const cancel = document.querySelector('#dialog-close');
        const expiry = document.querySelector('#expiry');
        const shortlink = document.querySelector('#bitly-link');
        const round = document.querySelector('.round');
        const copy = document.querySelector('#copy');
        const line = document.querySelector('#line');
        const closebutton = document.querySelector('#closebutton');
        const warning = document.querySelector('#warning');

        // Getting the bitlyLink CustomField value
        
        let targetCF = (invoice?.custom_fields || []).find((field) => field.placeholder === fieldName);

        
        //close Button
        
        function close(){
            ZFAPPS.closeModal();
        }

        closebutton.addEventListener('click', close)

        // Listner for generate Button
           
        generate.addEventListener('click',() => {

            if (invoice?.status == 'sent' || invoice?.status == 'overdue' || invoice?.status == 'paid') {

                api_call();
                round.classList.add('active');
            }
            else { 
                warning.classList.add('active');
                popup.innerText = "You can generate an invoice link only if it is already sent or is marked as sent.";
                ZFAPPS.invoke('RESIZE', { width: '535px', height: '370px' });   
            }

        });

        //Listner for Regenerate Button 

        regenerate.addEventListener('click', () => {
            
            bitly.classList.add('hide');
            dialog.classList.add('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '438px' });

        });

        //dialog-confirm Button

        confirm.addEventListener('click', () => {

            Link.classList.remove('active');
            dialog.classList.remove('active');
            generate.classList.remove('active');
            line.classList.remove('active');
            expiry.classList.remove('active'); 
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '318px' });

        });

        //dialog-close Button

        cancel.addEventListener('click',() => {
            
            dialog.classList.remove('active');
            bitly.classList.remove('hide');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '375px' });

        });

        //copybutton

        copy.addEventListener('click',async() => {

            let copyText = shortlink.textContent;

            try {
                await window.navigator.clipboard.writeText(copyText);
                copy.innerText= 'Copied!!!';
                setTimeout(close,1000);
               
            }catch(err) {

                console.log(err);
                alert(err);
            }            

        });

        //set limit for date

        const expiryDateupdate = () => {

            let today = new Date().toISOString().slice(0, 10);
            let after90 = new Date();
            after90.setDate(parseInt(after90.getDate()) + 90);
            after90 = after90.toISOString().slice(0, 10);
            expiry.setAttribute('min', today);
            expiry.setAttribute('max', after90);
            expiry.value = after90;   

        }

        //call when program is start to show if bilty is already present 2 module is display 

        const populateData = (bitlyLink) => {
                
            if(bitlyLink) {
               
                ZFAPPS.invoke('RESIZE', { width: '526px', height: '378px' });
                Link.classList.add('active');
                round.classList.remove('active');
                generate.classList.add('active');
                line.classList.add('active');
                bitly.classList.remove('hide');
                shortlink.innerText = bitlyLink; 
                expiry.classList.add('active');  
                ZFAPPS.invoke('REFRESH_DATA','invoice');
                
            }
        }

        //mainfunction here we  made api call to (invoics , bitly , updatecustomfield)

        const api_call = async() => {

            let invoiceLink = await generateInvoiceLink();
            let newBitlyLink = invoiceLink?.link && await generateBitlyLink(invoiceLink?.link);

            if (String(newBitlyLink).includes("bit.ly")) { 
                await updateBitlyCustomerField(newBitlyLink);   
                populateData(newBitlyLink);
            }
            else {
                warning.classList.add('active');
                let msg = newBitlyLink || invoiceLink?.message;
                popup.innerText=msg;
                round.classList.remove('active');
                ZFAPPS.invoke('RESIZE', { width: '535px', height: '370px' });
            }
            
            
        }

        //Invoice Link Api call

        const generateInvoiceLink = async() => {

            let expiryDate = expiry.value;
            let invoiceLinkOptions = {
            url:  booksAPIPrefix + '/share/paymentlink',
            method: "GET",
            url_query: [{
                key: 'organization_id',
                value: organization.organization_id
            }, {
                key: 'transaction_id',
                value: invoice.invoice_id
            }, {
                key: 'expiry_time',
                value: expiryDate
            }, {
                key: 'transaction_type',
                value: 'invoice'
            }, {
                key: 'link_type',
                value: linkType
            }],
            connection_link_name: booksConnection
            };
            try {
                let { data: { body } } = await ZFAPPS.request(invoiceLinkOptions);
                let parsedBody = JSON.parse(body);
                if(parsedBody?.code===0){
                    return {
                       link : parsedBody?.data?.share_link
                    }
                }
                throw parsedBody?.message;
                
            }catch (err) {
                console.log(err);
                return {
                    message:err.message || err 
                }
            }
        
        }

        //Bitly Link API Call

        const generateBitlyLink = async(invoiceLink) => {
            
            invoiceLink=invoiceLink.trim();
            let bitlyBodyData={ long_url: invoiceLink };
           
            let bitlyLinkOptions = {
                url:'https://api-ssl.bitly.com/v4/shorten',
                method:'POST',
                header:[{
                    key:'Content-Type',
                    value:'application/json'
                }],
                body:{
                    mode:'raw',
                    raw:JSON.stringify(bitlyBodyData)
                },
                connection_link_name: bitlyConnection
            };
            try {
                let { data: { body } } = await ZFAPPS.request(bitlyLinkOptions);
                let parsedBody =  JSON.parse(body);
                return parsedBody.link || parsedBody.description;
            }
            catch(err) {
                console.log(err);
            }
          
        }

        // update CustomField API call

        const updateBitlyCustomerField = async(link) => {

            let invoiceCFUpdateOptions = {

                url:  booksAPIPrefix + '/invoices/' + invoice.invoice_id,
                method: 'PUT',
                url_query: [{
                    key: 'organization_id',
                    value: organization.organization_id
                }],
                header:[{
                key: 'Content-Type',
                value: 'application/json;charset=UTF-8'
                }],
                body: {
                mode: 'formdata',
                formdata: [{
                    key: 'JSONString',
                    value: {
                    custom_fields: [{
                        api_name: fieldName,
                        value: link
                    }]
                    },
                }]
                },
                connection_link_name: booksConnection

            };
            try {
                let { data: { body } } = await ZFAPPS.request(invoiceCFUpdateOptions);
                let { invoice = {} } = JSON.parse(body);
                let cfNewValue = (invoice?.custom_fields || []).find((field) => field.placeholder === fieldName);
                // if link is not present in customfields 
                if (cfNewValue?.value !== link) {
                    throw 'CF value not updated properly';
                }
            } 
            catch(err) {
                console.log(err);
            };

        }

        expiryDateupdate();
        populateData(targetCF?.value); // if link is present it will shown.  
    });
}
