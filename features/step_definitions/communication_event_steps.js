import CommunicationEvent from '../support/CommunicationEvent'
import ErpType            from '../support/ErpType'

var {
			defineSupportCode
		} = require('cucumber')


defineSupportCode(function ({
															Given,
															When,
															Then
														}) {
	Given('a communication event note of {string}', function (note, done) {
		if (this.communication_event) {
			this.communication_event.note = note
		} else {
			this.communication_event = new CommunicationEvent({note})
		}
		done()
	})

	Given('a communication event status is {string}', async function (communication_event_status_description) {
		this.communication_event_status = new ErpType(await this.db.one('select id, description, parent_id from communication_event_status_type where description = ${communication_event_status_description}', {communication_event_status_description}))
		if (this.communication_event) {
			this.communication_event.communication_event_status_type_id = this.communication_event_status.id
		} else {
			this.communication_event = new CommunicationEvent({communication_event_status_type_id: this.communication_event_status.id})
		}
	})

	Given('a communication event is for a relationship between party {int} and party {int}', function (from_party_index, to_party_index, done) {
		if (this.communication_event) {
			this.communication_event.party_relationship_id = this.party_relationship.id
		} else {
			this.communication_event = new CommunicationEvent({party_relationship_id: this.party_relationship.id})
		}
		done()
	})

	Given('a communication event contact mechanism type is {string}', async function (contact_mechanism_type_description) {
		this.contact_mechanism_type = new ErpType(await this.db.one('select id, description, parent_id from contact_mechanism_type where description = ${contact_mechanism_type_description}', {contact_mechanism_type_description}))
		if (this.communication_event) {
			this.communication_event.contact_mechanism_type_id = this.contact_mechanism_type.id
		} else {
			this.communication_event = new CommunicationEvent({contact_mechanism_type_id: this.contact_mechanism_type.id})
		}
	})

	When('I create a communication event', async function () {
		try {
			this.result.data = await this.db.one('insert into communication_event(note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id) values(${note}, ${contact_mechanism_type_id}, ${party_relationship_id}, ${communication_event_status_type_id}) returning id, started, ended, note, contact_mechanism_type_id, party_relationship_id, communication_event_status_type_id, case_id', this.communication_event)
		} catch (error) {
			this.result.error = error
		}
	})

	Then('I find the communication event in the database', function (done) {
		expect(this.result.data.note).to.equal(this.communication_event.note)
		expect(this.result.data.contact_mechanism_type_id).to.equal(this.communication_event.contact_mechanism_type_id)
		expect(this.result.data.party_relationship_id).to.equal(this.communication_event.party_relationship_id)
		expect(this.result.data.communication_event_status_type_id).to.equal(this.communication_event.communication_event_status_type_id)
		done()
	})
})