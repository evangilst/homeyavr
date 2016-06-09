# HOMEYAVR

## generation application

1. Clone the repository http://github.com/evangilst/homeyavr
2. **cd homeyavr** - goto the new dirctory
3. **node install** -  instal all required npm packages
4. **Generate**
	* **grunt buildall**     - builds everything
	* **grunt buildapp**     - builds the homey application
	* **grunt buildtest**    - builds the test environment
	* **grunt builddocs**    - Builds the documentation (jsdoc).
5. **Build directory**:
	* **./dist/docs**                - the documentation output.
	* **./dist/test**                - The test enviroment.
	* **./dist/nl.evgilst.homeyavr** - The homey application directory.

## Testing.
1. Goto **src/test** directory
2. **Edit** avrtest.js
3. **Change** IP address (IPADDRESS) to the IP address of the server which will run avrsim.
4. **Generated** the test environment as describe above.
5. **cd ./dist/test** for 2 terminals
6. on terminal-1: **node aversim**
7. on terminal-2: **node avrtest**
