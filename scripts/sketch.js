let textArea;
let diagrams = [];
let fontSize = 25;
let textHeight;
let d = 60;
let dx, dy = d + 10, dl;
let CANVAS;
let Consolas = [];

function preload()
{
	append(Consolas, loadFont('fonts/consola.ttf'));
	append(Consolas, loadFont('fonts/consolab.ttf'));
}

function setup()
{
	select('#fontsize').changed(Update_Font_Size);
	select('#diameter').changed(Update_Diameter);
	select('#normal').changed(Update_Font);
	select('#bold').changed(Update_Font);
	select('#reset').mouseClicked(Reset_Settings);
	
	let importFile = createFileInput(Update_Text_Area);
	importFile.style('display','none');
	importFile.id('importButton');
	importFile.attribute('accept','.txt');
	
	select('#export').mouseClicked(Export_File);
	
	textArea = select('#textArea');
	textArea.drop(Update_Text_Area, Drag_Leave);
    textArea.dragOver(Drag_Over);
    textArea.dragLeave(Drag_Leave);
	
	select('#generate').mouseClicked(Generate);
	
	select('#download').mouseClicked(Download);
	
	CANVAS = createCanvas(1,1).parent('canvasPreview');
	CANVAS.style('margin:5px');
	background(0,0);
	
	Update_Font();
	textSize(fontSize);
	
	noLoop();
	
}

function draw()
{
	noFill();
	let y = 2;
	for(let i = 0; i < diagrams.length; i++)
	{
		image(diagrams[i], 2, y);
		rect(1,y - 1, diagrams[i].width, diagrams[i].height);
		y += 20 + diagrams[i].height;
	}
	fill(255);
}

function Update_Font_Size()
{
	fontSize = select('#fontsize').value();
	textSize(fontSize);
	Update_Font();
}

function Update_Diameter()
{
	d = select('#diameter').value();
	dy = d + 10;
}

function Update_Font()
{
	if(document.getElementById('normal').checked)
	{
		textFont(Consolas[0]);
		textHeight = Consolas[0].textBounds('I', 0, 0).h;
	}
	else
	{
		textFont(Consolas[1]);
		textHeight =  Consolas[1].textBounds('I', 0, 0).h;
	}
}

function Reset_Settings()
{
	document.getElementById('fontsize').value = 25;
	fontSize = 25;
	document.getElementById('diameter').value = 60;
	d = 60;
	document.getElementById('normal').checked = true;
	Update_Font();
}

function Update_Text_Area(file)
{
  if(file.type != 'text')
    return;
  document.getElementById('textArea').value = file.data;
}

function Drag_Over()
{
	textArea.style('background-color','#555')
	textArea.style('color','yellow')
}

function Drag_Leave()
{
	textArea.style('background-color','black')
	textArea.style('color','white')
}

function Export_File()
{
	if(textArea.value().length == 0)
		return;
	
	let blob = new Blob([textArea.value()], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "[KAAVIO] Transition Diagram Data.txt");
}

function Generate_Diagram(data, dwidth)
{
	let f = data.length-1;
	
	append(diagrams, createGraphics(int(dwidth + 1), int(data[f][2] + 1)));
	
	let di = diagrams.length - 1;
	
	diagrams[di].background(0,0);   
	diagrams[di].textFont(Consolas[int(!document.getElementById('normal').checked)]);
	diagrams[di].textSize(fontSize);
	
	let sx = d/2 + 1, sy = d/2 + 1 + 6;
	let x = 0, y = 0;
	let state = data[f][1];
	
	for(let i = 0; i < data.length - 1; i++)
	{
		for(let j = 0; j < data[0].length; j++)
			if(match(data[i][j], "<LOOP/>"))
			{
				console.log("LOOPED", data[i][j]);
				sy += dl;
				break;
			}
		
		if(i == 0)
		{
			diagrams[di].textAlign(CENTER, CENTER);
			diagrams[di].circle(sx, sy, d); 
			diagrams[di].text(data[f][0], sx, sy); 
		}
		
		y = sy + dy * i;
		
		for(let j = 0; j < data[i].length; j++)
		{
			x = sx + (dx + d) * (j+1);
			
			if(match(data[i][j], "<LOOP/>"))
			{
				let loopdata = data[i][j].split("<LOOP/>");
				data[i][j] = loopdata[0];
				diagrams[di].curve(x - 400,y + 100, x, y, x, y - d / 2, x - 10, y + 200);
				diagrams[di].line(x, y - d / 2, x - 5,y - d / 2 - 5);
				diagrams[di].line(x, y - d / 2, x + 5,y - d / 2 - 5);
				diagrams[di].textAlign(CENTER, BOTTOM);
				diagrams[di].text(loopdata[1], x, y - d / 2 - 8);
				diagrams[di].textAlign(CENTER, CENTER);
			}
			
			diagrams[di].line(x - d / 2, y, x - d / 2 - dx, y);
			diagrams[di].line(x - d / 2, y, x - d/2 - 5, y - 5);
			diagrams[di].line(x - d / 2, y, x - d/2 - 5, y + 5);
			
			diagrams[di].textAlign(CENTER, BOTTOM);
			diagrams[di].text(data[i][j], x - d / 2 - dx / 2, y);
			diagrams[di].textAlign(CENTER, CENTER);
			
			diagrams[di].circle(x, y, d); 
			
			if(j == data[i].length - 1)
			{
				diagrams[di].circle(x, y, d - 5); 
				diagrams[di].textSize(30);              
				diagrams[di].textFont('Consolas');   
				diagrams[di].text("∗", x + d/2, y - d / 2);
				diagrams[di].textFont(Consolas[int(!document.getElementById('normal').checked)]);   
				diagrams[di].textSize(fontSize);           
			}
			diagrams[di].text(state, x, y);
			state++;
		}
	}
	/*
	if(document.getElementById('normal').checked)
		textFont(Consolas[0]);
	else
		textFont(Consolas[1]);
	text("Immigrant", 100, 100);
	textFont('Consolas');
	text("∗", 100,120);
	*/
}

function Generate()
{	
	if(textArea.value().length == 0)
		return;
		
	diagrams = [];
	
	let text = textArea.value();
	let lString = "";
	let data = [[]];
	let temp = "";
	let newArray = true, looped = false;
	let i = 0, j = -1;
	let sState = 0, nState = 1, lState = 0, loops = 0;
	
	

	dl = 22 + textHeight;
	
	//Determine longest keyword / Store Data / Format Data
	for(let c = 0; c <= text.length; c++)
	{
		if(c == text.length || text[c] == ' ' || text[c] == '\t' || text[c] == '\n')
		{
			if(temp != "")
			{
				if(temp == "<NEXT/>")
				{
					// [START STATE, NEXT STATE, HEIGHT]
					append(data[i],[str(sState), str(nState), 10 + (data[i].length * d) + (10 * (data[i].length - 1)) + (dl * loops)]);
					sState = 0;
					nState = lState + 1;
					
					append(data, []);
					i++;
					j = -1;
					loops = 0;
					lArray = 0;
				}
				else if(temp == "<CONT/>")
				{
					append(data[i],[str(sState), str(nState), 10 + (data[i].length * d) + (10 * (data[i].length - 1)) + (dl * loops)]);
					sState = lState - 1;
					nState = lState + 1;
					
					append(data, []);
					i++;
					j = -1;
					loops = 0;
					lArray = 0;
				}
				else
				{
					if(match(temp, "<LOOP/>"))
					{
						let left = split(temp, "<LOOP/>")[0];
						if(left.length > lString.length)
							lString = left;
						looped = true;
					}
					else if(temp.length > lString.length)
						lString = temp;
						
					if(newArray)
					{
						append(data[i],[]);
						j++;
						newArray = false;
					}
					append(data[i][j], temp);
					lState++;
				}
				temp = "";
			}
			if(text[c] == '\n')
			{
				if(looped)
				{
					loops++;
					looped = false;
				}
				newArray = true;	
			}
			if(c == text.length)
			{
				if(looped)
				{
					loops++;
					looped = false;
				}
				append(data[i],[str(sState), str(nState), 10 + (data[i].length * d) + (10 * (data[i].length - 1)) + (dl * loops)]);
			}				
		}			
		else
			temp += text[c];
	}
	console.log(lString);
	dx = 18 + Consolas[int(!document.getElementById('normal').checked)].textBounds(lString, 0, 0).w;
	console.log(dx);
	for(let i = 0 ; i < data.length; i++)
	{
		let lArray = 0;
		
		for(let j = 1; j < data[i].length; j++)
			if(data[i][j].length > data[i][lArray].length)
				lArray = j;
		//console.log(data[i][lArray]);
		//LEEWAY OF HORIZONTAL SIDES + 
		Generate_Diagram(data[i], 10 + ((data[i][lArray].length + 1) * d) + (dx * data[i][lArray].length));
	}
	
	let ch = 4;
	let lDiagram = 0;
	for(let i = 0; i < diagrams.length; i++)
	{
		if(diagrams[i].width > diagrams[lDiagram].width)
			lDiagram = i;
			
		ch += diagrams[i].height;
	}
	resizeCanvas(4 + diagrams[lDiagram].width, ch + 20 * (diagrams.length - 1));
}

function Download()
{
	if(diagrams.length > 0)
	{
		let zip = new JSZip();
		for(let i = 0; i < diagrams.length; i++)
		{
			let data_URL = diagrams[i].canvas.toDataURL()
			zip.file('TD ' + str(i+1) +'.png', data_URL.substring(22,data_URL.length), {base64: true});
		}
		zip.generateAsync({type:"blob"}).then(function(content) {saveAs(content, "[KAAVIO] Transition Diagrams.zip");});
	}
}

