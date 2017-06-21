import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import rastreio from 'rastreio';
export const Items = new Mongo.Collection('items');
const status = (code) => rastreio([code], { resultado:'T', formato: 'json'}).then(obj => JSON.parse(obj)).then(o => o.objeto.evento)
if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('items', function tasksPublication() {
    return Items.find(
        { owner: this.userId }
			);
  });
}

Meteor.methods({
  'items.insert'({code, desc}) {
    check(code, String);
		if(!/[a-z0-9]{13}/i.test(code.toUpperCase())){
			throw new Meteor.Error('invalid-code');
		}
    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

		if(Items.findOne({ code, username: Meteor.users.findOne(this.userId).username})){
			throw new Meteor.Error('already-registered');
		}
    const id = Items.insert({
      code,
			desc,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
		if(Meteor.isServer){
			// console.log('asdasd');
			status(code).then(status => {
				// console.log(status);
				Items.update(id, { $set: { status } });

			}, error => console.error(error))
		}

		// rastreio([code], { resultado:'T', formato: 'json'}).then(console.log)

  },
  'items.remove'(taskId) {
    check(taskId, String);

    const task = Items.findOne(taskId);
    if (task.owner !== this.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Items.remove(taskId);
  },
	'items.update'({id, code, desc}) {
		check(id, String);

    const item = Items.findOne(id);
    if (item.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
		let query;
		if(code){
			query = query || {};
			query.code = code;
		}

		if(desc){
			query = query || {};
			query.desc = desc;
		}
		if(query){
				Items.update(id, {$set: query});
		}
		if(Meteor.isServer){
			// console.log();
			status(item.code).then(status => {
				// console.log(status);
				Items.update(id, { $set: { status } });

			}, error => console.error(error))
		}
	}
});
