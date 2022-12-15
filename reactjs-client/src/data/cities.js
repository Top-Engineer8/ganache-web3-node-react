import React, {useState, useEffect} from 'react';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

import paginationFactory from 'react-bootstrap-table2-paginator';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import Axios from 'axios';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Web3 from 'web3';
// after build the contract (inside src folder) by (truffle migrate --reset) command
import CityContractBuild from '../build/contracts/Cities.json';

import { ReactComponent as CityLogo } from "../assets/icons/admin/cityLogo.svg";

function Cities() {
  const [cities, setCities] = useState([]);

  const [cityDialog, setCityDialog] = React.useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [actionButton, setActionButton] = useState('');  
  const [cityId, setCityId] = useState(0);
  const [cityName, setCityName] = useState('');
  const [ifSmartContract, setIfSmartContract] = useState(false);

  const all_cities = Axios.create({
    baseURL: "http://localhost:3001/api/cities" 
  });

  useEffect(() => {
    all_cities.get()
    .then((response) => {
      setCities(response.data);
    })
    .catch(error => console.log(error));
  }, []);
  
  const columns = [
    {dataField: 'name', text: 'Name', filter: textFilter()},
    {
      dataField: "action",
      text: "Action",
      formatter: (cellContent, row) => {
        return ( <div>
            <button
              className="btn btn-danger btn-xs"
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </button>&nbsp;&nbsp;
            <button
              className="btn btn-warning btn-xs"
              onClick={() => handleUpdate(row.id, false)}
            >
              Edit by API
            </button>
            <button
              className="btn btn-warning btn-xs"
              onClick={() => handleUpdate(row.id, true)}
            >
              Edit by Smart contract
            </button>
          </div>
        );
      },
    }
  ];

  function handleDelete (id) {
    confirmAlert({
      title: 'Delete City!',
      message: 'Are you sure you want to delete the record?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            try {
              Axios.put('http://localhost:3001/api/city/', {city_id: id})
              .then((response) => {
                if (response.data === 'RelatedRecords') {
                  alert('Can not delete city, there is related records');
                } else {
                  alert('Delete city successfully');
                  setCities(
                    cities.filter((city) => {
                      return city.id !== id;
                    })
                  );
                }
              });
            } catch (error) {
              console.log(error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  }

  function handleUpdate (rowId, ifSmartContract) {
    setIfSmartContract(ifSmartContract);
    editCity(rowId);
  }

    const paginationOptions = {
        paginationSize: 10,
        pageStartIndex: 1,
        firstPageText: 'First',
        prePageText: 'Back',
        nextPageText: 'Next',
        lastPageText: 'Last',
        nextPageTitle: 'First page',
        prePageTitle: 'Pre page',
        firstPageTitle: 'Next page',
        lastPageTitle: 'Last page',
        showTotal: true
    };

    
  return (
    <div style={{width: 500}}>
      <div className="add-btn" onClick={() => openCityDialog(false)}>
        Add City from API <CityLogo style={{width: 100}} />
      </div>
      <div className="add-btn" onClick={() => openCityDialog(true)}>
        Add City from Smart Contract <CityLogo style={{width: 100}} />
      </div>

      {<BootstrapTable 
        keyField='id' 
        columns={columns} 
        data={cities} 
        filter={filterFactory()}
        pagination={paginationFactory(paginationOptions)} />
      }

          <Dialog open={cityDialog} onClose={closeCityDialog}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <TextField autoFocus margin="10px" id="city_name" label="Name" value={cityName} 
                fullWidth variant="standard" onChange={handleInputCity}
                error={cityName.length === 0}
                helperText={'Name field is required'}/>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeCityDialog}>Cancel</Button>
              <Button onClick={handleCity}>{actionButton}</Button>
            </DialogActions>
          </Dialog>



          <br/>
          <br/>
          <div className="add-btn" onClick={() => getCitiesFromSmartContract()}>
            Get cities from Smart Contract
          </div>
        </div>
      );




  // handle city dialog ..
  function openCityDialog (ifSmartContract) {
    setCityName("");
    setDialogTitle("Add City");
    setActionButton("Add");
    setIfSmartContract(ifSmartContract);
    setCityDialog(true);
  }

  function closeCityDialog () {
    setCityDialog(false);
  };
 
  function handleInputCity (event) {
    setCityName(event.target.value);
  }

  async function handleCity () {
    if(cityName !== '' && dialogTitle === "Add City") { // Add functionality ..

      if(ifSmartContract === false) { // if not smart contract ..
        Axios.post('http://localhost:3001/api/city/', {
          name: cityName
        }).then((response) => addCityResponse(response) );
      } else { // if smart contract .. call smart contract function .. inside it call API
        // web3.js
        let provider = window.ethereum;
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        // Load account
        const accounts = await web3.eth.getAccounts();
        const account0 = accounts[0];

        var cityContract = new web3.eth.Contract(CityContractBuild.abi, 
          CityContractBuild.networks[networkId].address);

        await cityContract.methods.addCityByAPIToDatabase(cityName, account0)
        .send({from: account0})
        .then(e => {
          // to do the task here ..
          // get the response from smart contract function and check it..


          //alert("Add City successfully");

          // refresh the list ..
          //all_cities.get().then((response) => {
          // setCities(response.data);
          //});
        });
      }

    } else  if(cityName !== '' && dialogTitle === "Edit City") { // edit city
      closeCityDialog();

      if(ifSmartContract === false) { // if not smart contract ..
        Axios.put('http://localhost:3001/api/city/', {
          query_type: "update", city_id: cityId, name: cityName
        }).then(() => {
          // refresh the list ..
          all_cities.get().then((response) => {
            setCities(response.data);
          });
          alert('Edit city successfully');
        });
      } else { // if smart contract .. call smart contract function .. inside it call API
        // web3.js
        let provider = window.ethereum;
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        // Load account
        const accounts = await web3.eth.getAccounts();
        const account0 = accounts[0];

        var cityContract = new web3.eth.Contract(CityContractBuild.abi, 
          CityContractBuild.networks[networkId].address);

        await cityContract.methods.updateCityByAPIToDatabase(cityId, cityName, account0)
        .send({from: account0})
        .then(e => {
          // to do the task here ..
          // get the response from smart contract function and check it..


          //alert("Edit city successfully");

          // refresh the list ..
          //all_cities.get().then((response) => {
          // setCities(response.data);
          //});
        });

      }

    }
  }

  function addCityResponse (response) {
    closeCityDialog();
    if(response.data[0] === 'undefined') {
      alert("Wrong data, please try again");
    } else {
      alert("Add city successfully");
      // refresh the list ..
      all_cities.get().then((response) => {
        setCities(response.data);
      });
    }
  }

  function editCity (id) {
    // Show dialog with edit details
    // get data from city list based on row id ..
    cities.filter((city) => city.id === id).map((city) => {
      setCityName(city.name);
      setCityId(city.id);
      setDialogTitle("Edit City");
      setActionButton("Edit");
      setCityDialog(true);
    });
  }

  async function getCitiesFromSmartContract() {
    // web3.js
    let provider = window.ethereum;
    const web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();
    // Load account
    const accounts = await web3.eth.getAccounts();
    const account0 = accounts[0];

    var cityContract = new web3.eth.Contract(CityContractBuild.abi, 
      CityContractBuild.networks[networkId].address);

    await cityContract.methods.getCitiesByAPIToDatabase(account0)
    .send({from: account0})
    .then(e => {
      // to do the task here ..
      // get the response from smart contract function and print it in console ..



      
    });
  }

}

export default Cities;
