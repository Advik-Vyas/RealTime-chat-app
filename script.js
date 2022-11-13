(function(){
    let element = function(id){
        return document.getElementById(id);
    }

    //Get element
    let status = element('status');
    let messages = element('messages');
    let textarea = element('textarea');
    let username = element('username');
    let clearBtn = element('clear');

    // Set default status
    let statusDefault = status.textContent;

    let setStatus = function(s){
        //Set status
        status.textContent = s;

        if(s !== statusDefault){
            let delay = setTimeout(function(){
                setStatus(statusDefault);
            }, 4000);
        }
    }

    //Connect to socket.io

    let socket = io.connect('https://127.0.0.1:4000');

    //check for connection

    if (socket !== undefined){
        console.log('Connected to socket...');
        //Handles output
        socket.on('output',function(data){
            // console.log(data);
            if(data.length){
                for(let x = 0;x < data.length;x++){
                    let message = document.createElement('div');
                    message.setAttribute('class','chat-message');
                    message.textContent = data[x].name+": "+data[x].message;
                    messages.appendChild(message);
                    messages.insertBefore(message,messages.firstChild);
                }
            }
        });

        // Get status from server
        socket.on('status',function(){
            setStatus((typeof data === 'object')? data.message : data);
        
            //If status clear
            if(data.clear){
                textarea.value = '';
            }
        });
        //Handles Input
        textarea.addEventListener('keydown',function(event){
            if(event.which === 13 && event.shiftKey == false){
                socket.emit('input',{
                    name: username.value,
                    message: textarea.value
                });
                event.preventDefault();
            }
        });
    }

})();
