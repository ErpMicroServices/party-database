// features/support/world.js
import config from "./config";
import database from "./database";

var {
    defineSupportCode
} = require('cucumber');

function CustomWorld() {
  this.config = config;
  this.db = database;
  this.person = {
      id: '',
      first_name: '',
      last_name: '',
      title: '',
      nickname: '',
      date_of_birth: '',
      comment: '',
      email_address: ''
  };

	this.party_type = {};

  this.organization = {
    id: '',
    roles: []
  }

  this.relationship = {
    status: {
      description:''
    }
  }

  this.contact_mechanism_types = [];
  this.party_types = [];
  this.party_relationship_types = [];
  this.party_role_types = [];
  this.party_relationship_status_types =[];

  this.email_id = () => this.contact_mechanism_types.find((cm) => cm.description === 'Email Address').id;

  this.party_type_id = (party_type) => this.party_types.get( party_type);

  this.party_role_type = (party_role_type) => this.party_role_types.find(pt => pt.description === party_role_type).id;

  this.party_relationship_type =  description => this.party_relationship_types.find( prt => prt.description === description);

  this.party_relationship_status_type = description => this.party_relationship_status_types.find( prst => prst.description === description);

  this.result = {
      error: null,
      data: null
  };
}

defineSupportCode(function({
  setWorldConstructor
}) {
  setWorldConstructor(CustomWorld)
});
