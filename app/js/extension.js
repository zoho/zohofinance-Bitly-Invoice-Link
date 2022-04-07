window.onload=function(){
    ZFAPPS.extension.init().then( async() => {
        ZFAPPS.invoke('RESIZE', { width: '526px', height: '310px' });

        // Data

        var organization = await ZFAPPS.get('organization').then((data) => data?.organization);
        var invoice = await ZFAPPS.get('invoice').then((data) => data?.invoice);
        var invoice_id=invoice?.invoice_id;
        var invoice_status=invoice?.status;

        // Config

        const fieldName = 'cf__u0q6k_bitly_invoice_link';
        const booksConnection = 'zohobooksbitly';
        const bitlyConnection = 'zbbitly';
        const booksAPIPrefix = `https://books.zoho${ organization.data_center_extension || '.com' }/api/v3`;
        const linkType = 'public';
        const bitlyDomain = null;
        const bitlyGrp = null;

         // Elements

        const popup=document.querySelector('#popup');
        const generate=document.querySelector('#generate');
        const Link=document.querySelector('#Link');
        const regenerate=document.querySelector('#regenerate');
        const bitly=document.querySelector('#bitly');
        const dialog=document.querySelector('#dialog');
        const confirm=document.querySelector('#dialog-confirm');
        const cancel=document.querySelector('#dialog-close');
        const expiry = document.querySelector('#expiry');
        const shortlink=document.querySelector('#bitly-link');
        const round=document.querySelector('.round');
        const copy=document.querySelector('#copy');

         // Getting the bitlyLink CustomField value
        
        var customFields = invoice?.custom_fields || [];
        var targetCF = customFields.find((field) => field.placeholder === fieldName);
        var bitlyLink = targetCF?.value;

        if(invoice_status=='sent'|| invoice_status=='overdue' || invoice_status=='paid'){
            generate.classList.remove('function');
        }
        else{
            generate.classList.add('function');
        }
        //generate Button

        generate.addEventListener('click',()=>{
            if(invoice_status=='sent'|| invoice_status=='overdue' || invoice_status=='paid'){
                mainfunct();
                round.classList.add('active');
            }
            else{
                generate.classList.add('function');
            }
            });

        //Regenerate Button 

        regenerate.addEventListener('click',()=>{
            ZFAPPS.invoke('RESIZE', { width: '550px', height: '450px' });
            dialog.classList.add('active');
            bitly.classList.add('active');
            round.classList.remove('active');
            
        });

        //dialog-confirm Button

        confirm.addEventListener('click',()=>{
            Link.classList.remove('active');
            dialog.classList.remove('active');
            bitly.classList.remove('active');
            generate.classList.remove('active');
            expiry.classList.remove('active'); 
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '310px' });
        });

        //dialog-close Button

        cancel.addEventListener('click',()=>{
            dialog.classList.remove('active');
            bitly.classList.remove('active');
            ZFAPPS.invoke('RESIZE', { width: '526px', height: '375px' });
        });

        //copybutton

        copy.addEventListener('click',()=>{
            var copyText = bitlyLink;
            window.navigator.clipboard.writeText(copyText).then(()=> {
                copy.innerText= 'Copied!!!';
                setTimeout(close,1000);
                function close(){
                    ZFAPPS.closeModal();
                }
            
            }).catch((err)=>{
               console.log(err);
               alert("err");
            })
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

        //call when program is start to show if bilty is already present 2 tag is display 

        const populateData=()=>{
                
            if(bitlyLink){
               
                ZFAPPS.invoke('RESIZE', { width: '526px', height: '375px' });
                Link.classList.add('active');
                generate.classList.add('active');
                ZFAPPS.invoke('REFRESH_DATA','invoice');
                shortlink.innerText =bitlyLink; 
                expiry.classList.add('active');  
            }
        }

        const rePopulateData =populateData; 

        //mainfunction here we call all the api (invoics , bitly , updatecustomfield)

        const mainfunct=async()=>{

            let invoice;
            let invoiceLink= await generateInvoiceLink();
            let newBitlyLink= await generateBitlyLink(invoiceLink);
            if(String(newBitlyLink).includes("bit.ly")){
                bitlyLink =newBitlyLink;
                invoice= await updateBitlyCustomerField(newBitlyLink);   
            }
            else{
                
                let msg=''
                msg +='<div id="warning">'+newBitlyLink+'</div>'
                popup.innerHTML=msg;
                round.classList.remove('active');
                ZFAPPS.invoke('RESIZE', { width: '535px', height: '310px' });
            }
            rePopulateData();
            
        }

        //Invoice Link Api call

        const generateInvoiceLink=async()=>{

            let expiryDate = expiry.value;
            let invoiceLinkOptions = {
            url:  booksAPIPrefix + '/share/paymentlink',
            method: "GET",
            url_query: [{
                key: 'organization_id',
                value: organization.organization_id
            }, {
                key: 'transaction_id',
                value: invoice_id
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
           return await ZFAPPS.request(invoiceLinkOptions)
            .then((response) => {
                let body = response?.data?.body;
                return JSON.parse(body).data.share_link; 
            }).catch(function (err) {
                console.log(err);
            });
        }

        //Bitly Link API Call

        const generateBitlyLink=async(invoiceLink)=>{
            
            invoiceLink=invoiceLink.trim();
            let bitlyBodyData={long_url:invoiceLink};
            if(bitlyDomain){
                bodyData.domain=bitlyDomain;
            }
            if(bitlyGrp){
                bodyData.group_guid=bitlyGrp;
            }
            let bitlyLinkOptions={
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
                connection_link_name:bitlyConnection
            };
            return await ZFAPPS.request(bitlyLinkOptions)
            .then((response)=>{
                let body = response?.data?.body;
                return JSON.parse(body).link || JSON.parse(body).description;
                
            }).catch(function (err) {
                console.log(err);
            });
        }

        // CustomField API call

        const updateBitlyCustomerField = async(link) => {

            let invoiceCFUpdateOptions = {
                url:  booksAPIPrefix + '/invoices/' + invoice_id,
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
           return await ZFAPPS.request(invoiceCFUpdateOptions)
            .then((response) => {
            let body = response?.data?.body;
            let invoice = JSON.parse(body).invoice;
            let cfNewValue = invoice.custom_fields.find((field) => field.placeholder === fieldName).value; 
            if (cfNewValue === link) {
                return invoice;
            } else {
                throw 'CF value not updated properly';
            }
            }).catch(function (err) {
                console.log(err);
              });
        }
        expiryDateupdate();
        populateData(); // if link is present it will shown.  
 });
}
