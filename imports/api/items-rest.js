import {Items} from "./items.js";
if(!Meteor.isServer){
	return;
}
const Api = new Restivus({
	useDefaultAuth: true,
	prettyJson: true
});

Api.addRoute('items', {authRequired: true}, {
	get(){
		let ret;
		Meteor.runAsUser(Meteor.userId(), function() {
			// Run method as user on both client or server
			ret = Items.find(
					{ owner: Meteor.userId() }
				);
		});
		return ret;
	},
	post(){
		let ret;
		Meteor.runAsUser(Meteor.userId(), function() {
			// Run method as user on both client or server
			ret = Meteor.call('items.insert', {code: this.bodyParams.code, desc: this.bodyParams.desc});
		});
		return ret;

	}
});
Api.addRoute('item/:id', {authRequired: true}, {
	get: function () {
		return Items.findOne({ code: this.urlParams.id, username: Meteor.users.findOne(Meteor.userId()).username})
	},
	put: function () {
		let ret;
		Meteor.runAsUser(Meteor.userId(), function() {
			// Run method as user on both client or server
			ret = Meteor.call('items.update', {id: this.urlParams.id, code: this.bodyParams.code, desc: this.bodyParams.desc});
		});
		return ret;
	},
	delete: {
		action: function () {
			let ret;
			Meteor.runAsUser(Meteor.userId(), function() {
		    // Run method as user on both client or server
		    ret = Meteor.call('items.remove', this.urlParams.id);
		  });
			return ret;
		}
	}
});
