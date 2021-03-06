import moment             from 'moment'
import CommunicationEvent from '../support/CommunicationEvent'
import ErpType            from '../support/ErpType'

var {
			defineSupportCode
		}=require('cucumber')


defineSupportCode(function ({
															Given,
															When,
															Then
														}) {
	Given('a communication event with a note of {string}', function (note, done) {
		if (this.communication_event) {
			this.communication_event.note=note
		} else {
			this.communication_event=new CommunicationEvent({note})
		}
		done()
	})

	Given('a communication event status is {string}', async function (communication_event_status_description) {
		this.communication_event_status=new ErpType(await this.db.one('select id, description, parent_id from communication_event_status_type where description = ${communication_event_status_description}', {communication_event_status_description}))
		if (this.communication_event) {
			this.communication_event.communication_event_status_type_id=this.communication_event_status.id
		} else {
			this.communication_event=new CommunicationEvent({communication_event_status_type_id: this.communication_event_status.id})
		}
	})

	Given('a communication event is for a relationship between party {int} and party {int}', function (from_party_index, to_party_index, done) {
		if (this.communication_event) {
			this.communication_event.party_relationship_id=this.party_relationship.id
		} else {
			this.communication_event=new CommunicationEvent({party_relationship_id: this.party_relationship.id})
		}
		done()
	})

	Given('a communication event contact mechanism type is {string}', async function (contact_mechanism_type_description) {
		this.contact_mechanism_type=new ErpType(await this.db.one('select id, description, parent_id from contact_mechanism_type where description = ${contact_mechanism_type_description}', {contact_mechanism_type_description}))
		if (this.communication_event) {
			this.communication_event.contact_mechanism_type_id=this.contact_mechanism_type.id
		} else {
			this.communication_event=new CommunicationEvent({contact_mechanism_type_id: this.contact_mechanism_type.id})
		}
	})

	Given('a communication event has a type of {string}', async function (communication_event_type_description) {
		this.communication_event_type=new ErpType(await this.db.one('select id, description, parent_id from communication_event_type where description = ${communication_event_type_description}', {communication_event_type_description}))
		if (this.communication_event) {
			this.communication_event.communication_event_type_id=this.communication_event_type.id
		} else {
			this.communication_event=new CommunicationEvent({communication_event_type_id: this.communication_event_type.id})
		}

	})

	Given('the communication event is in the database', async function () {
		this.communication_event_list.push(await this.db.one('insert into communication_event(note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, communication_event_type_id, started, ended) values( ${note}, ${contact_mechanism_type_id}, ${party_relationship_id}, ${communication_event_status_type_id}, ${communication_event_type_id}, ${started}, ${ended}) returning id, started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id, communication_event_type_id', this.communication_event))
	})

	Given('a communication event starts on {string} at {string}', function (date_string, time_string, done) {
		const start=moment(`${date_string} ${time_string}`)
		if (this.communication_event) {
			this.communication_event.started=start
		} else {
			this.communication_event=new CommunicationEvent({started: start})
		}
		done()
	})

	Given('a communication event ends on {string} at {string}', function (date_string, time_string, done) {
		if (this.communication_event) {
			this.communication_event.ended=moment(date_string + "T" + time_string)
		} else {
			this.communication_event=new CommunicationEvent({ended: moment(date_string + "T" + time_string)})
		}
		done()
	})

	Given('the communication event is  part of the case', async function () {
		const last_ce  =this.communication_event_list[this.communication_event_list.length - 1]
		last_ce.case_id=this.case.id
		this.db.none('update communication_event set case_id = ${case_id} where communication_event.id = ${id}', last_ce)
	})

	Given('communication events:', async function (dataTable) {
		let table=dataTable.rawTable
		for (let row_index in table) {
			const data_row                                   =table[row_index]
			const note                                       =data_row[0]
			const party_1_index                              =data_row[1]
			const party_2_index                              =data_row[2]
			const communication_event_status_type_description=data_row[3]
			const contact_mechanism_type_description         =data_row[4]
			const communication_event_type_description       =data_row[5]
			const started                                    =moment(data_row[6])
			const ended                                      =null
			const party_1                                    =this.parties[party_1_index - 1]
			const party_2                                    =this.parties[party_2_index - 1]
			const party_relationships                        =await this.db.any('select id, from_date, thru_date, comment, from_party_role_id, to_party_role_id, party_relationship_type_id, party_relationship_status_type_id, priority_type_id from party_relationship where (from_party_role_id = (select id from party_role where party_id = ${party_1_id})and to_party_role_id = (select id from party_role where party_id = ${party_2_id}))or (to_party_role_id = (select id from party_role where party_id = ${party_1_id}) and from_party_role_id =(select id from party_role where party_id = ${party_2_id}))', {
				party_1_id: party_1.id,
				party_2_id: party_2.id
			})
			this.contact_mechanism_type                      = await this.db.one('select id, description, parent_id from contact_mechanism_type where description=${contact_mechanism_type_description}',
																																					 {contact_mechanism_type_description})
			this.communication_event_type                    = await this.db.one('select id, description, parent_id from communication_event_type where description = ${communication_event_type_description}',
																																					 {communication_event_type_description})
			this.communication_event_status_type             = await this.db.one('select id, description, parent_id from communication_event_status_type where description = ${communication_event_status_type_description}',
																																					 {communication_event_status_type_description})
			const new_communication_event                    =await this.db.one('insert into communication_event (started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, communication_event_type_id, case_id) values (${started}, ${ended}, ${note}, ${contact_mechanism_type_id}, ${party_relationship_id}, ${communication_event_status_type_id}, ${communication_event_type_id}, ${case_id}) returning id, started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, communication_event_type_id, case_id', {
				note                              : note,
				contact_mechanism_type_id         : this.contact_mechanism_type.id,
				party_relationship_id             : party_relationships[0].id,
				communication_event_status_type_id: this.communication_event_status_type.id,
				communication_event_type_id       : this.communication_event_type.id,
				started,
				ended,
				case_id                           : null
			})
			this.communication_event_list.push(new_communication_event)
		}
	})

	When('I create a communication event', async function () {
		try {
			this.result.data= await this.db.one('insert into communication_event(note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, communication_event_type_id) values(${note}, ${contact_mechanism_type_id}, ${party_relationship_id}, ${communication_event_status_type_id}, ${communication_event_type_id}) returning id, started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id, communication_event_type_id', this.communication_event)
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events of type {string}', async function (communication_event_type_description) {
		try {
			this.result.data= await this.db.any('select communication_event.id as id, started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id, communication_event_type_id from communication_event, communication_event_type where communication_event_type.description = ${communication_event_type_description} and communication_event.communication_event_type_id = communication_event_type.id', {communication_event_type_description})
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events that occurred between {string} and {string} on {string}', async function (start_time_string, end_time_string, date_string) {
		try {
			const start_time=moment(`${date_string} ${start_time_string}`)
			const end_time  =moment(`${date_string} ${end_time_string}`)
			this.result.data= await this.db.any('select communication_event.id as id, started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id, communication_event_type_id from communication_event where started >= ${start_time} and ended <= ${end_time}', {
				start_time,
				end_time
			})
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events using contact mechanism {string}', async function (contact_mechanism_type_description) {
		try {
			this.result.data= await this.db.any('select communication_event.id, started, ended, note, communication_event_type_id, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id from communication_event, contact_mechanism_type where contact_mechanism_type.description = ${contact_mechanism_type_description} and contact_mechanism_type.id = communication_event.contact_mechanism_type_id', {contact_mechanism_type_description})
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events using a party relationship of type {string} and party role {string} and party role {string}', async function (party_relationship_type_description, from_party_role_description, to_party_role_description) {
		try {
			this.result.data= await this.db.any('select communication_event.id, started, ended, note, communication_event_type_id, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id from communication_event, party_relationship, party_relationship_type where party_relationship.from_party_role_id = (select party_role.id from party_role, party_role_type where party_role_type.description = ${from_party_role_description} and party_role.party_role_type_id = party_role_type.id) and party_relationship.to_party_role_id = (select party_role.id from party_role, party_role_type where party_role_type.description = ${to_party_role_description} and party_role.party_role_type_id = party_role_type.id) and party_relationship_type.description = ${party_relationship_type_description} and party_relationship.party_relationship_type_id = party_relationship_type.id and communication_event.party_relationship_id = party_relationship.id', {
				party_relationship_type_description,
				from_party_role_description,
				to_party_role_description
			})
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events with a status of {string}', async function (communication_event_status_description) {
		try {
			this.result.data= await this.db.any('select communication_event.id, started, ended, note, communication_event_type_id, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id from communication_event, communication_event_status_type where communication_event_status_type.description = ${communication_event_status_description} and communication_event.communication_event_status_type_id = communication_event_status_type.id', {communication_event_status_description})
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events that belongs to a case with description of {string}', async function (case_description) {
		try {
			this.result.data= await this.db.any('select  communication_event.id, started, ended, note, communication_event_type_id, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id from communication_event, "case" where "case".description = ${case_description} and communication_event.case_id = "case".id', {case_description})
		} catch (error) {
			this.result.error=error
		}
	})

	When('I search for communication events that belongs to party {int}', async function (party_index) {
		try {
			this.result.data= await this.db.any('select communication_event.id, ' +
																						'       started, ' +
																						'       ended, ' +
																						'       note, ' +
																						'       communication_event_type_id, ' +
																						'       contact_mechanism_type_id, ' +
																						'       party_relationship_id, ' +
																						'       communication_event_status_type_id, ' +
																						'       case_id ' +
																						'from communication_event, ' +
																						'     party_relationship ' +
																						'where communication_event.party_relationship_id = party_relationship.id ' +
																						'  and (party_relationship.from_party_role_id in (select party_role.id ' +
																						'                                                 from party_role, ' +
																						'                                                      party ' +
																						'                                                 where party_role.party_id = party.id ' +
																						'                                                   and party.id = ${id}) ' +
																						'  or party_relationship.to_party_role_id in (select party_role.id ' +
																						'                                             from party_role, ' +
																						'                                                  party ' +
																						'                                             where party_role.party_id = party.id ' +
																						'                                               and party.id = ${id}))', this.parties[party_index - 1])
		} catch (error) {
			this.result.error=error
		}
	})

	Then('I find the communication event in the database', function (done) {
		expect(this.result.data.note).to.equal(this.communication_event.note)
		expect(this.result.data.contact_mechanism_type_id).to.equal(this.communication_event.contact_mechanism_type_id)
		expect(this.result.data.party_relationship_id).to.equal(this.communication_event.party_relationship_id)
		expect(this.result.data.communication_event_status_type_id).to.equal(this.communication_event.communication_event_status_type_id)
		done()
	})

	Then('the communication event of type {string} is found', async function (communication_event_type_description) {
		const communicationEventType=await this.db.one('select id, description, parent_id from communication_event_type where description = ${communication_event_type_description}', {communication_event_type_description})
		let communicationEvent      =this.communication_event_list.find(ce => ce.communication_event_type_id === communicationEventType.id)
		expect(this.result.data).to.be.an('array')
		expect(this.result.data.length).to.be.above(0)
		this.result.data.forEach(event => expect(event).to.deep.equal(communicationEvent))
	})

	Then('the communication event of type {string} is not found', async function (communication_event_type_description) {
		const communicationEventType=await this.db.one('select id, description, parent_id from communication_event_type where description = ${communication_event_type_description}', {communication_event_type_description})
		let communicationEvent      =this.communication_event_list.find(ce => ce.communication_event_type_id === communicationEventType.id)
		expect(this.result.data).to.be.an('array')
		this.result.data.forEach(event => expect(event).to.not.deep.equal(communicationEvent))
	})


})
