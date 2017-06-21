import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './item.html';

Template.item.helpers({
	checked() {
		return this.status && this.status.tipo.includes("BD") && this.status.status === "01";
	},
  isOwner() {
    return this.owner === Meteor.userId();
  },
});

Template.item.events({
	'click li'(e, instance){
		delete instance.status;
		console.log('aqui');
		Meteor.call('items.update', {id:this._id});
	},
  'click .toggle-checked'() {
    // Set the checked property to the opposite of its current value
    Meteor.call('items.setChecked', this._id, !this.checked);
  },
  'click .delete'() {
    Meteor.call('items.remove', this._id);
  },
  'click .toggle-private'() {
    Meteor.call('items.setPrivate', this._id, !this.private);
  },
});
