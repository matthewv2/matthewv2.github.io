let fontSize = 25, bold = 0, state = 1, d = 60, dy = d + 10;
let tdMaker, tdMakerButton, tdTester, tdTesterButton, dataArea, defArea, delimArea, inputArea, outputArea, importFile;
let textHeight, dx, dl, CANVAS, data;
let Consolas = [], diagrams = [];

function preload()
{
	append(Consolas, loadFont('fonts/consola.ttf'));
	append(Consolas, loadFont('fonts/consolab.ttf'));
}

function setup()
{
	
	select('#fontsize').changed(Update_Font_Size);
	select('#diameter').changed(Update_Diameter);
	select('#normal').changed(Update_Font_Bold);
	select('#bold').changed(Update_Font_Bold);
	select('#reset').mouseClicked(Reset_Settings);
	
	tdMaker = select("#tdMaker");
	tdMakerButton = select("#tdMakerButton");
	
	tdTester = select("#tdTester");
	tdTesterButton = select("#tdTesterButton");
	
	CANVAS = createCanvas(1,1).parent('canvasPreview');
	CANVAS.style('margin:5px');
	background(0,0);
	
	dataArea = select('#dataArea');
	defArea = select('#defArea');
	delArea = select('#delArea');
	inputArea = select('#inputArea');
	outputArea = select('#outputArea');
	
	importFile = createFileInput(Import_File);
	importFile.style('display','none');
	importFile.attribute('accept','.txt');
	importFile.id('importButton');
	
	textSize(fontSize);
	Update_Text_Height();
	noLoop();
	

	window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
	var confirmationMessage = '';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
	});
}
 
function draw()
{
	let y = 2;
	for(let i = 0; i < diagrams.length; i++)
	{
		rect(1,y - 1, diagrams[i].width, diagrams[i].height);
		image(diagrams[i], 2, y);
		y += 20 + diagrams[i].height;
	}
}

function TD_Maker()
{
	tdTester.style("display", "none");
	tdTesterButton.style("color", "white");
	tdMaker.style("display", "");
	tdMakerButton.style("color", "yellow");
}

function TD_Tester()
{
	tdMaker.style("display", "none");
	tdTesterButton.style("color", "yellow");
	tdTester.style("display", "");
	tdMakerButton.style("color", "white");
}

function Update_Diameter()
{
	d = int(select('#diameter').value());
	dy = d + 10;
}

function Update_Font_Size()
{
	fontSize = int(select('#fontsize').value());
	textSize(fontSize);
	Update_Text_Height();
}

function Update_Font_Bold()
{
	bold = int(document.getElementById('bold').checked);
	Update_Text_Height();
}

function Update_Text_Height()
{
	textHeight = Consolas[bold].textBounds('I', 0, 0).h;
}

function Reset_Settings()
{
	document.getElementById('fontsize').value = 25;
	Update_Font_Size();
	document.getElementById('diameter').value = 60;
	Update_Diameter();
	document.getElementById('normal').checked = true;
	Update_Font_Bold();
}

function Import_File(file)
{
  if(file.type != 'text')
    alert("The file you uploaded is not a text file!");
  else
  {
	let text = split(file.data, '\n\n<TEST/>\n');
	document.getElementById('inputArea').value = text[1];
	
	
	text = split(text[0], '\n\n<DELI/>\n');
	document.getElementById('delArea').value = text[1];
	
	text = split(text[0], '\n\n<DEFI/>\n');
	document.getElementById('defArea').value = text[1];
	document.getElementById('dataArea').value = text[0];
  }
  importFile.value("");
}

function Export_Text()
{
	if(dataArea.value().length == 0 && defArea.value().length == 0 && delArea.value().length == 0 && inputArea.value().length == 0)
		alert("You don't have anything to export!");
	else
	{
		let text = dataArea.value() + "\n\n<DEFI/>\n" + defArea.value() + "\n\n<DELI/>\n" + delArea.value() + "\n\n<TEST/>\n" + inputArea.value();
		let blob = new Blob([text], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "[KAAVIO] TD Data.txt");
	}
}

function Export_TD()
{
	if(diagrams.length == 0)
		alert("You have not generated any transition diagrams!");
	else
	{
		let zip = new JSZip();
		for(let i = 0; i < diagrams.length; i++)
		{
			let data_URL = diagrams[i].canvas.toDataURL();
			zip.file('TD ' + str(i+1) +'.png', data_URL.substring(22,data_URL.length), {base64: true});
		}
		zip.generateAsync({type:"blob"}).then(function(content) {saveAs(content, "[KAAVIO] Transition Diagrams.zip");});
	}
}

function Generate_Diagram(data, dwidth)
{
	let f = data.length - 1;
	append(diagrams, createGraphics(int(dwidth + 1), int(data[f][1] + 1)));
	let di = diagrams.length - 1;
	diagrams[di].background(0,0);   
	diagrams[di].textFont(Consolas[bold]);
	diagrams[di].textSize(fontSize);
	diagrams[di].strokeWeight(2);
	diagrams[di].pixelDensity(1);
	let sx = d / 2 + 2, sy = d / 2 + 1 + 6, offY = 0, x = 0, y = 0;
	
	for(let i = 0; i < data.length - 1; i++)
	{
		let offL = 0;
		for(let j = 0; j < data[i].length; j++)
		{
			if(match(data[i][j], "<LOOP/>"))
			{
				offY += dl;
				offL = dl;
				break;
			}
		}
		y = sy + dy * i + offY;
		if(i == 0)
		{
			diagrams[di].textAlign(CENTER, CENTER);
			diagrams[di].circle(sx, y, d); 
			if(data[f][0])
				diagrams[di].text(state - 2, sx, y);
			else
				diagrams[di].text(0, sx, y);
		}
		let L = true;
		for(let j = 0; j < data[i].length; j++)
		{
			if(data[i][j] == "") continue;
			
			x = sx + (dx + d) * (j+1);
			
			if(i != 0 && L)
			{
				diagrams[di].line(x - d / 2 - dx, y, x - d - dx, y);
				for(I = i - 1; I >= 0 && j <= data[I].length; I--)
				{
					if(data[I][j] == "")
						diagrams[di].line(x - d - dx, y - dy * (i - I - 1), x - d - dx, y - dy * (i - I) - offL);
					else
					{
						if(j == 0)
						{
							if(I == 0)
								diagrams[di].line(x - d - dx, y - dy * (i - I - 1), x - d - dx, y - dy * (i - I) + d / 2 - offL);
							else
								diagrams[di].line(x - d - dx, y - dy * (i - I - 1), x - d - dx, y - dy * (i - I) - offL);
						}
						else if(data[I][j - 1] == "") 
							diagrams[di].line(x - d - dx, y - dy * (i - I - 1), x - d - dx, y - dy * (i - I) - offL);
						else
							diagrams[di].line(x - d - dx, y - dy * (i - I - 1), x - d - dx, y - dy * (i - I) + d / 2 - offL);
						break;
					}
					
				}
				L = false;
			}
			if(match(data[i][j], "<LOOP/>"))
			{
				let loopdata = data[i][j].split("<LOOP/>");
				data[i][j] = loopdata[0];
				diagrams[di].curve(x - 400,y + 100, x, y, x, y - d / 2, x - 10, y + 200);
				diagrams[di].line(x, y - d / 2, x - 5,y - d / 2 - 5);
				diagrams[di].line(x, y - d / 2, x + 5,y - d / 2 - 5);
				diagrams[di].textAlign(CENTER, BOTTOM);
				diagrams[di].text(loopdata[1], x, y - d / 2 - 10);
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
				diagrams[di].circle(x, y, d - 8); 
				diagrams[di].textSize(30);              
				diagrams[di].textFont('Consolas');   
				diagrams[di].text("∗", x + d/2 - 2, y - d/2 + 2);
				diagrams[di].textFont(Consolas[bold]);   
				diagrams[di].textSize(fontSize);           
			}
			diagrams[di].text(state, x, y);
			state++;
		}
	}
}

function Generate()
{	
	if(dataArea.value().length == 0)
		alert("You have not inputted any data!");
	else
	{
		diagrams = [];
		
		let text = dataArea.value();
		let lString = "";
		data = [[]];
		let temp = "";
		let newArray = true, looped = false, cont = false, del = true;
		let i = 0, j = -1;
		let loops = 0;
		
		dl = 22 + textHeight;
		
		for(let c = 0; c <= text.length; c++)
		{
			if(c == text.length || text[c] == ' ' || text[c] == '\t' || text[c] == '\n')
			{
				if(temp != "")
				{
					if(temp == "<NEXT/>" || temp == "<CONT/>")
					{
						append(data[i],[cont, 10 + (data[i].length * d) + (10 * (data[i].length - 1)) + (dl * loops)]);
						append(data, []);
						cont = (temp == "<CONT/>");
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
							del = true;
							newArray = false;
						}
						append(data[i][j], temp);
						
						for(let J = j - 1; del && J >= 0 && data[i][J].length >= data[i][j].length; J--)
						{
							if(data[i][j][data[i][j].length-1] == data[i][J][data[i][j].length-1])
							{
								data[i][j][data[i][j].length-1] = "";
								break;
							}
							else if(data[i][J][data[i][j].length-1])
								del = false;
						}
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
					append(data[i],[cont, 10 + (data[i].length * d) + (10 * (data[i].length - 1)) + (dl * loops)]);
				}				
			}			
			else
				temp += text[c];
		}
		dx = 18 + Consolas[bold].textBounds(lString, 0, 0).w;
		state = 1;
		let ch = 4, lDiagram = 0;
		for(let i = 0 ; i < data.length; i++)
		{
			let lArray = 0;
			for(let j = 1; j < data[i].length - 1; j++)
				if(data[i][j].length > data[i][lArray].length)
					lArray = j;
			Generate_Diagram(data[i], 10 + ((data[i][lArray].length + 1) * d) + (dx * data[i][lArray].length));
			if(diagrams[i].width > diagrams[lDiagram].width)
				lDiagram = i;
			ch += diagrams[i].height;
		}
		resizeCanvas(4 + diagrams[lDiagram].width, ch + 20 * (diagrams.length - 1));
		
		temp = [];
		for(let i = 0; i < data.length; i++)
		{
			let spaces = [];
			if(data[i][data[i].length-1][0])
			{
				for(let j = 0; j < temp[temp.length-1].length-1; j++)
					append(spaces, "");
			}
			for(let j = 0; j < data[i].length - 1; j++)
				append(temp, spaces.concat(data[i][j]))
		}
		data = [];
		data = temp;
		
		//console.log(data);
	}
}

function Test()
{
	
}
