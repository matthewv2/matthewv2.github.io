let fontSize = 25, bold = 0, state = 1, d = 60, dy = d + 10;
let textHeight, dx, dl, CANVAS, textArea;
let diagrams = [], Consolas = [];

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
	
	textArea = select('#textArea');
	textArea.drop(Update_Text_Area, Drag_Leave);
    textArea.dragOver(Drag_Over);
    textArea.dragLeave(Drag_Leave);
	
	CANVAS = createCanvas(1,1).parent('canvasPreview');
	CANVAS.style('margin:5px');
	background(0,0);
	
	let importFile = createFileInput(Update_Text_Area);
	importFile.style('display','none');
	importFile.attribute('accept','.txt');
	importFile.id('importButton');
	select('#export').mouseClicked(Export_File);
	select('#generate').mouseClicked(Generate);
	select('#download').mouseClicked(Download);
	
	textSize(fontSize);
	Update_Text_Height();
	noLoop();
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
	if(textArea.value().length == 0)
		return;
		
	diagrams = [];
	
	let text = textArea.value();
	let lString = "";
	let data = [[]];
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
}

function Download()
{
	if(diagrams.length > 0)
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
