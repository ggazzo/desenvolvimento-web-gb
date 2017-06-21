import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

// import { Tasks } from '../api/tasks.js';
import { Items } from '../api/items.js';


import './item.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('items');
});

Template.body.helpers({
	items(){
		const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Items.find({ $or : [{'status.status': { $ne: "01" }} , {'status.tipo': { $nin: [ "BDE", "BDR", "BDI" ] }}]}, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the tasks
    return Items.find({}, { sort: { createdAt: -1 } });
	},
  incompleteCount() {
    return Items.find({ checked: { $ne: true } }).count();
  },
});

Template.body.events({
  'submit .new-item'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
		const code = target.code.value;
		const desc = target.desc.value;
		// Clear form
		target.code.value = '';
		target.desc.value = '';
    // Insert a task into the collection
    Meteor.call('items.insert', {code, desc});
  },

  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
});
