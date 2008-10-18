function writeFile(name, text)
{
	var file = new java.io.File(name);
	
	if(file.exists())
		file['delete']();
	
	if(file.isDirectory())
		return false;
	
	file.createNewFile();
	
	var writer = new java.io.BufferedWriter(new java.io.FileWriter(file));
	writer.write(text);
	writer.close();
	
	return true;
};