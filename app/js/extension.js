window.onload=function(){
    ZFAPPS.extension.init().then( async() => {
        ZFAPPS.invoke('RESIZE', { width: '526px', height: '350px' });

        // Data

        let { organization } = await ZFAPPS.get('organization');
        let { invoice } = await ZFAPPS.get('invoice');
      

        // Config

        const fieldName = 'cf__uvrmc_bitly_invoice_link';
        const expiryfieldName = 'cf__uvrmc_bitly_link_expiry_at';
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
        const shortlink = document.querySelector('#bitly-link');
        const round = document.querySelector('.round');
        const copy = document.querySelector('#copy');
        const closebutton = document.querySelector('#closebutton');
        const warning = document.querySelector('#warning');
        const Button15 = document.querySelector('#firsthalf');
        const Button30 = document.querySelector('#secondhalf');
        const Button45 = document.querySelector('#thirdhalf');
        const Button60 = document .querySelector("#fourthhalf");
        const custom = document.querySelector('#fifthhalf');
        const radio = document.querySelector('#radio');
        const expiry_date_value = document.querySelector('#content-expiry-value')
        const vue_datepicker = document.querySelector('#vue-datepicker')
        const custom_option = document.querySelector('#custom-option')


        // Getting the bitlyLink CustomField value
        
        let targetCF = (invoice?.custom_fields || []).find((field) => field.placeholder === fieldName);
        let targetCFE = (invoice?.custom_fields || []).find((fields)=> fields.placeholder === expiryfieldName);

  
        
        //close Button
        
        function close(){
            ZFAPPS.closeModal();
        }

        closebutton.addEventListener('click', close)

        $(document).ready(function() {
            $('.e-date-icon').click(function (){
                let value = vue_datepicker.getAttribute('aria-activedescendant')
                if(value != 'null'){
                    ZFAPPS.invoke('RESIZE', { width: '526px', height: '610px' });
                    Link.classList.add('hide');
                }
                else{
                    ZFAPPS.invoke('RESIZE', { width: '526px', height: '420px' })
                    Link.classList.remove('hide');
                }

            }) 
        })

        // Listner for generate Button

        Button15.addEventListener('click',() =>{
            Button15.classList.add('active');
            Button30.classList.remove('active');
            Button45.classList.remove('active');
            Button60.classList.remove('active');
            custom.classList.remove('active');
            let after15 = new Date();
            after15.setDate(parseInt(after15.getDate()) + 15);
            after15 = after15.toISOString().slice(0, 10);
            expiry_date_value.innerText = after15
            custom_option.classList.add('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '350px' });
            

        })
        Button30.addEventListener('click',() =>{
            Button15.classList.remove('active');
            Button30.classList.add('active');
            Button45.classList.remove('active');
            Button60.classList.remove('active');
            custom.classList.remove('active');
            let after30 = new Date();
            after30.setDate(parseInt(after30.getDate()) + 30);
            after30 = after30.toISOString().slice(0, 10);
            expiry_date_value.innerText = after30
            custom_option.classList.add('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '350px' });

        })
        Button45.addEventListener('click',() =>{
            Button15.classList.remove('active');
            Button30.classList.remove('active');
            Button45.classList.add('active');
            Button60.classList.remove('active');
            custom.classList.remove('active');
            let after45 = new Date();
            after45.setDate(parseInt(after45.getDate()) + 45);
            after45 = after45.toISOString().slice(0, 10);
            expiry_date_value.innerText = after45
            custom_option.classList.add('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '350px' });

        })
        Button60.addEventListener('click',() =>{
            Button15.classList.remove('active');
            Button30.classList.remove('active');
            Button45.classList.remove('active');
            Button60.classList.add('active');
            custom.classList.remove('active');
            let after60 = new Date();
            after60.setDate(parseInt(after60.getDate()) + 60);
            after60 = after60.toISOString().slice(0, 10);
            expiry_date_value.innerText = after60
            custom_option.classList.add('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '350px' });

        })
        custom.addEventListener('click',()=>{
            Button15.classList.remove('active');
            Button30.classList.remove('active');
            Button45.classList.remove('active');
            Button60.classList.remove('active');
            custom.classList.add('active');
            expiry_date_value.innerText = ''
            custom_option.classList.remove('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '420px' });
        })



        generate.addEventListener('click',() => {

            if (invoice?.status == 'sent' || invoice?.status == 'overdue' || invoice?.status == 'paid') {

                api_call();
                round.classList.add('active');
            }
            else { 
                warning.classList.add('active');
                popup.innerText = "You can generate an invoice link only if it is already sent or is marked as sent.";
                ZFAPPS.invoke('RESIZE', { width: '535px', height: '410px' });   

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
            Button15.classList.remove('active');
            Link.classList.remove('active');
            dialog.classList.remove('active');
            generate.classList.remove('active');
            radio.classList.remove('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '350px' });

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
            Button15.classList.add('active');
            let after15 = new Date();
            after15.setDate(parseInt(after15.getDate()) + 15);
            after15 = after15.toISOString().slice(0, 10);
            expiry_date_value.innerText = after15
            custom_option.classList.add('active');
        }

        //call when program is start to show if bilty is already present 2 module is display 

        const populateData = (bitlyLink,due_date) => {
                
            if(bitlyLink) {
               
                ZFAPPS.invoke('RESIZE', { width: '526px', height: '378px' });
                Link.classList.add('active');
                radio.classList.add('active');
                round.classList.remove('active');
                generate.classList.add('active');
                bitly.classList.remove('hide');
                custom_option.classList.add('active');
                shortlink.innerText = bitlyLink; 
                expiry_date_value.innerText = due_date;
                Link.classList.remove('hide');
                ZFAPPS.invoke('REFRESH_DATA','invoice');
                
            }
        }

        //mainfunction here we  made api call to (invoics , bitly , updatecustomfield)

        const api_call = async() => {

            let invoiceLink = await generateInvoiceLink();
            let newBitlyLink = invoiceLink?.link && await generateBitlyLink(invoiceLink?.link);

            if (String(newBitlyLink).includes("bit.ly")) { 
                await updateBitlyCustomerField(newBitlyLink);   
                populateData(newBitlyLink,expiry_date_value.innerText);
            }
            else {
                warning.classList.add('active');
                generate.classList.add('active');
                let msg = newBitlyLink || invoiceLink?.message;
                popup.innerText=msg;
                round.classList.remove('active');
                ZFAPPS.invoke('RESIZE', { width: '535px', height: '420px' });

            }
            
            
        }

        //Invoice Link Api call

        const generateInvoiceLink = async() => {

            let expiryDate = expiry_date_value.innerText;
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
                    },{
                        api_name: expiryfieldName,
                        value: expiry_date_value.innerText
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
        populateData(targetCF?.value,targetCFE?.value); // if link is present it will shown.  
    });
}
