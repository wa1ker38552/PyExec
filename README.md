# PyExec
Execute python remotely through a web application. 

Execute the code on the machine the app is being hosted on. **You can't stdin**. Uses socketIO to ensure that data is being sent in real-time. This program has no safety features at all so anyone can just delete the root directory and kill the program or do something harmful/malicioius. 

**Deploying**<br>
Install command `pip install -r requirements.txt`<br>
Build command `python main.py`
