localStorage.setItem('issues', JSON.stringify([]));
const m = document.getElementById("myTable").rows.length - 1
const n = document.getElementById("myTable").rows[0].cells.length - 1

document.querySelector('table').onclick = function() {
	let td = event.target.closest('td');

	if (!td) return;

	if (!this.contains(td)) return;

	let invBtn = document.getElementById("checkbox").checked;
	if (invBtn==false) {
		highlight(td,'free');
	} else {
		highlight(td,'occupied')
	}
}

function highlight(td,cl) {
	// Tag version:
	//
	// if (td.getAttribute('occupied') == "true") {
	// 	td.setAttribute('occupied',"false");
	// } else if (td.getAttribute('occupied') == "false" | td.hasAttribute('occupied') == "false") {
	// 	td.setAttribute('occupied',"true");
	// };

	td.classList.toggle(cl);
}

function tdFromIndex(index) {
	let col = Math.floor(index/m) + 1;
	let row = index%m + 1;
	return document.getElementById("myTable").rows[row].cells[col]
}



function gather(save) {
	let invBtn = document.getElementById("checkbox").checked;
	let table = document.getElementById("myTable");
	let localArr = [];
    if (table != null) {
        for (var col = 1; col < table.rows[0].cells.length; col++) {
            for (var row = 1; row < table.rows.length; row++){
                cell = table.rows[row].cells[col];
                if (save == true){
                	if (invBtn==true) {
                		localArr.push(Number(!cell.classList.contains('occupied')));
                	}else{
                		localArr.push(Number(cell.classList.contains('free')));
                	}
                	//localArr.push(cell.getAttribute('occupied')); tag version
                	

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
	gather(false);
	document.getElementById('occForm').reset();
}

function savePost() {

	var postName = document.getElementById('nameInput').value;
  	var postArr = gather(true);
  	var count = 0;
  	var html = "";
		for(var i = 0; i < postArr.length; ++i){
			count += Boolean(postArr[i]);
			if (Boolean(postArr[i]) == true) {
				html +='<td width="1px" class="free thin"></td>'
			} else {
				html +='<td width="1px" class="occupied thin"></td>'
			}
	}
  	var post = {
    	name: postName,
    	arr: postArr,
    	freeSlots: count,
  	}

  	if (localStorage.getItem('issues') == "[]") {
    	var posts = [];
    	posts.push(post);
    	var issues = {
    		posts: posts,
    		total: post.arr,
    	};
    	localStorage.setItem('issues', JSON.stringify(issues));
    	document.getElementById("postTable").style.visibility = "visible";
  	} else {
    	var issues = JSON.parse(localStorage.getItem('issues'));
    	issues.posts.push(post);
    	for (var i=0; i<issues.total.length;i++) {
	    		issues.total[i] += post.arr[i]
	    }
    	localStorage.setItem('issues', JSON.stringify(issues));
  	}


  	var postList = document.getElementById('postList');
  	var dimension = m*n;
  	postList.innerHTML +=  '<tr><td>'+postName+'</td><td>'+count+'</td>'+html+'</tr>';
  	document.getElementById('scheduleHead').setAttribute('colspan','28');
	  
	document.getElementById('occForm').reset();
  
  	//e.preventDefault(); 
}

function computeOptimal(size) {
	let radio1 = document.getElementById("radio1");
	let radio2 = document.getElementById("radio2");
	let groupSize = Number(radio1.checked) + 2*Number(radio2.checked);

	if (localStorage.getItem('issues') == "[]") {
    	alert('No submissions made yet!');
    	return
  	}
	let issues = JSON.parse(localStorage.getItem('issues'));
	let total = issues.total;

	// Find largest element in list
	let largestVal = [0];
	let largestInd = [];
	let groupTotal = total
	for (let i=0;i<total.length;i++){
		for (let j=1;j<groupSize;j++) {
			groupTotal[i] += total[i+j];
		}
		if (groupTotal[i]>largestVal[0]) {
			largestVal = [groupTotal[i]];
			largestInd = [i];
		} else if (groupTotal[i]==largestVal[0]) {
			largestVal.push(groupTotal[i]);
			largestInd.push(i);
		}
	}
	if (groupSize == 1) {
	largestInd.forEach(function(index) {
			highlight(tdFromIndex(index),'winner');
		})
	} else {
		for (let j=0;j<groupSize;j++) {
			highlight(tdFromIndex(largestInd[0]+j),'winner');	
		}
	}

	
	
}

function about() {
	document.getElementById("aboutP").classList.remove('isHidden');
	document.getElementById("formBig").classList.add('isHidden');
}

function normal() {
	document.getElementById("aboutP").classList.add('isHidden');
	document.getElementById("formBig").classList.remove('isHidden');
}

	
