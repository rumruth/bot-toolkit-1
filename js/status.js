class Status {
	constructor(element, dict) { 
		this.elem = element;
		this.dict = dict;
	}
	text(msg){
		$(this.elem).text(this.dict[msg]==undefined?msg:this.dict[msg]); 
		$(this.elem).attr("title", this.dict[msg]==undefined?msg:this.dict[msg]); 
	}
	success(msg) {
		$(this.elem).removeClass("progress-bar danger-status primary-status warning-status");
		$(this.elem).addClass("success-status");
	  	this.text(msg);
	}
	error(msg) {
		$(this.elem).removeClass("progress-bar success-status primary-status warning-status");
		$(this.elem).addClass("danger-status");
	  	this.text(msg);
	}
	loading(msg) {
		$(this.elem).removeClass("success-status danger-status warning-status");
		$(this.elem).addClass("progress-bar primary-status");
	  	this.text(msg);
	}
	warning(msg) {
		$(this.elem).removeClass("progress-bar success-status danger-status primary-status");
		$(this.elem).addClass("warning-status");
	  	this.text(msg);
	}
}
module.exports = Status;