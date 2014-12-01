var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Card = new Schema({
    accuracy: String,
    appear_date: Date,
    assist_entry_pattern: String,
    attack: String,
    attack_area: String,
	attack_area_type: String,
	attack_dist_max: String,
	attack_dist_min: String,
	attack_time: String,
	attribute: String,
	avoid: String,
	awake_power: Number,
	best_lvup_attack: String,
	best_lvup_defence: String,
	card_id: String,
	character_id: String,
	comment: String,
	cost: String,
	defence: String,
	delete_on_battle: String,
	event_power_txt: String,
	evol_card_id: String,
	evol_hp: String,
	evol_level: String,
	evol_max_level: String,
	favorite_map_id: String,
	is_healer: Number,
	is_repairer: Number,
	is_stun: Number,
	is_stun_vehicle: Number,
	last_update: Date,
	lvup_attack: String,
	lvup_attack_pat: String,
	lvup_defence: String,
	lvup_defence_pat: String,
	max_hp: String,
	max_level: String,
	max_usable_cnt: String,
	name: String,
	pack: String,
	per_num: Number,
	per_text: String,
	permission: String,
	price: String,
	prob_gacha1: String,
	prob_gacha2: String,
	prob_gacha3: String,
	prob_gacha4: String,
	prob_gacha5: String,
	prob_gacha6: String,
	prob_gacha7: String,
	prob_gacha8: String,
	prob_gacha9: String,
	prob_gacha10: String,
	prob_gacha11: String,
	prob_gacha12: String,
	prob_gacha13: String,
	prob_gacha14: String,
	prob_gacha15: String,
	prob_gacha16: String,
	prob_gacha17: String,
	prob_gacha18: String,
	prob_gacha19: String,
	prob_gacha20: String,
	race: String,
	range: String,
	rarity: String,
	rarity_full: String,
	series_id: String,
	skill_id: String,
	slot_x: String,
	slot_y: String,
	specialized_type: String,
	stackable_cnt: String,
	stackable_cnt_on_deck: String,
	stackable_cnt_on_slot: String,
	stackable_cnt_on_slot_atk: String,
	stackable_cnt_on_slot_def: String,
	sub_rarity: String,
	sub_type: String,
	thumb: String,
	type: String,
	user: String,
	weapon_motion_type: String,
	weapon_type: String    
});

mongoose.model( 'Card', Card );
mongoose.connect( 'mongodb://localhost/SWFC' );