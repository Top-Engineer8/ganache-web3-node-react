// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./v0.8/ChainlinkClient.sol";

contract Cities is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    address public manager;
    string public url;
    bytes public data;
    string public dataS; 
    
    constructor () {
         //Ethereum Kovan
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
        manager = msg.sender;
    }

    struct City {
        int id;
        string name;
    }

    mapping (int => City) private cities;

    /* //not importent code for the task..
    event cityAddedToContract(address user, string name);

    function addCityToContract(int cityId, string memory name) public {
        cities[cityId] = City(cityId, name);
        emit cityAddedToContract(msg.sender, name);
    }*/



    function getCitiesByAPIToDatabase(string memory accountAddress) 
        public view returns(string memory)
    {
        // here we need to call get API: http://localhost:3001/api/cities/
        // After call the API here we need to get the response
        // and return it to cities.js line 317


    }


    function addCityByAPIToDatabase(string memory cityName, string memory accountAddress) 
        public view returns(string memory)
    {
        // here we need to call post API: http://localhost:3001/api/city/ with city name
        // city name exist in query_url or must bass to this function
        // After call the API here we need to get the response
        // and return it to cities.js line 219



        // your old code ..
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        //req.add("get", string.concat("http://localhost:3001/api/management/10000/", password));
        req.add("get", "http://localhost:3001/api/management/10000/password"); //enter the password in here
        sendChainlinkRequestTo(oracle,req, fee);
        return dataS;
    }

    function updateCityByAPIToDatabase(string memory cityId, string memory cityName, string memory accountAddress) 
        public view returns(string memory)
    {
        // here we need to call put API: http://localhost:3001/api/city/
        // the API must pass with it: query_type: "update", city_id, name
        // After call the API here we need to get the response
        // and return it to cities.js line 260


    }



    function fulfill(bytes32 _requestId, bytes32 bytesData) public 
    recordChainlinkFulfillment(_requestId);
    {
        data = bytesData;
        dataS = string(data);
    }

    function withdrawLink() public {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

}
