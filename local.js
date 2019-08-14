localStorage.setItem('storage', JSON.stringify([]));
const m = document.getElementById("calendar").rows.length - 1
const n = document.getElementById("calendar").rows[0].cells.length - 1

document.querySelector('table').onclick = function() {
	let td = event.target.closest('td');

	if (!td) return;

	if (!this.contains(td)) return;

	// The cell selection can be inverted, if selectRed is true, slots turn busy when clicking
	let selectRed = document.getElementById("checkbox").checked;
	if (selectRed==false) {
		td.classList.toggle('free');
	} else {
		td.classList.toggle('occupied');
	}
}

function tdFromIndex(index) {
	// Returns the td element with the specified index
	// Cells are ordered first by column then by row (same dates first)
	let col = Math.floor(index/m) + 1;
	let row = index%m + 1;
	return document.getElementById("calendar").rows[row].cells[col]
}



function getBinArray(save) {
	// returns the binary array of free slots (if save==true)
	// clears all formatting of the calendar table
	let selectRed = document.getElementById("checkbox").checked;
	let table = document.getElementById("calendar");
	let localArr = [];
    if (table != null) {
        for (var col = 1; col < table.rows[0].cells.length; col++) {
            for (var row = 1; row < table.rows.length; row++){
            	// Loops through all cells:
                cell = table.rows[row].cells[col];
				
                if (save == true){
                	
                	if (selectRed==true) {

                		localArr.push(Number(!cell.classList.contains('occupied')));
                	} else {
                		localArr.push(Number(cell.classList.contains('free')));
                	}	

            	}
                cell.classList.remove('occupied');
                cell.classList.remove('free');
                cell.classList.remove('winner');

            }
        }
    }
    return localArr;
}

function resetSpace() {
	// Removes formatting and resets the form
	getBinArray(false);
	document.getElementById('occForm').reset();
}

function savePost() {
	var postName = document.getElementById('nameInput').value;
  	var postArr = getBinArray(true);
  	//console.log(postArr);
  	var count = 0;

  	// Creates a html representation of cells to append to the submissions table
  	var html = "";
		for(var i = 0; i < postArr.length; ++i){
			count += Boolean(postArr[i]);

			// Makes green cell if free, red cell if not
			if (Boolean(postArr[i]) == true) {
				html +='<td width="1px" class="free thin"></td>'
			} else {
				html +='<td width="1px" class="occupied thin"></td>'
		}
	}

	// Creates post object with name, binary array and number of free slots
  	var post = {
    	name: postName,
    	arr: postArr,
    	freeSlots: count,
  	}

  	// Store in localStorage together with histogram, which is array 
  	// with current no of bookings of each time slot
  	if (localStorage.getItem('storage') == "[]") {
    	var posts = [];
    	posts.push(post);
    	var storage = {
    		posts: posts,
    		histogram: post.arr,
    	};
    	localStorage.setItem('storage', JSON.stringify(storage));
    	document.getElementById("postTable").style.visibility = "visible";
  	} else {
    	var storage = JSON.parse(localStorage.getItem('storage'));
    	storage.posts.push(post);
    	for (var i=0; i<storage.histogram.length;i++) {
	    		storage.histogram[i] += post.arr[i]
	    }
    	localStorage.setItem('storage', JSON.stringify(storage));
  	}

  	var postList = document.getElementById('postList');
  	var dimension = m*n;
  	postList.innerHTML +=  '<tr><td>'+postName+'</td><td>'+count+'</td>'+html+'</tr>';
	document.getElementById('occForm').reset();
  
}

function computeOptimal() {
	if (localStorage.getItem('storage') == "[]") {
    	alert('No submissions made yet!');
    	return
  	}
  	/*
  	let hours = prompt("How many hours are needed for the occasion?",1);

  	if(!Number.isInteger(hours)) { // Default value if bad answer is received
  		hours = 1;
  	}
  	*/
  	let hours = 1;

	let storage = JSON.parse(localStorage.getItem('storage'));
	// histogram is array with no of bookings of each time slot
	let histogram = storage.histogram;

	// Find largest element in list
	let largestVal = [0];
	// largestInd contains the indices with highest no. of bookings
	let largestInd = [];

	for (let i=0;i<histogram.length;i++){

		if (histogram[i]>largestVal[0]) {
			largestVal = [histogram[i]];
			largestInd = [i];
		} else if (histogram[i]==largestVal[0]) {
			largestVal.push(histogram[i]);
			largestInd.push(i);
		}
	}

	// Multiple winners may be chosen
	largestInd.forEach(function(value) {
		tdFromIndex(value).classList.add('winner');
	})
}





function about() {
	document.getElementById("aboutP").classList.remove('isHidden');
	document.getElementById("formBig").classList.add('isHidden');
}

function normal() {
	document.getElementById("aboutP").classList.add('isHidden');
	document.getElementById("formBig").classList.remove('isHidden');
}

	
