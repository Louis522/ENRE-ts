import path from "path";
import {Dirent, promises as fs} from "fs";
import {debug, errorAndExit, info, verbose} from "./cliRender";
import global from "./global";

const getAbsPath = (iPath: string, base?: string, ...dirs: Array<string>): string => {
  iPath = path.normalize(iPath);

  if (!path.isAbsolute(iPath)) {
    iPath = path.join(base || global.indexPath, ...dirs, iPath)
  }

  return iPath;
}

export const getFileList = async (iPath: string, exclude: Array<string>|undefined): Promise<Array<string>> => {
  debug(`Current NODE_ENV is ${process.env.NODE_ENV}`);

  iPath = getAbsPath(iPath);

  debug(`Assigned input path is ${iPath}`);
  let fileList: Array<string> = [];

  try {
    let stats = await fs.stat(iPath);

    if (stats.isFile()) {
      if (exclude !== undefined)
        info('Ignoring exclude option due to input path is a file');

      fileList.push(iPath);
    } else if (stats.isDirectory()) {
      // TODO: Handle exclude files or directories
      let waitingList: Array<Dirent> = await fs.readdir(iPath, {withFileTypes: true});
      let dirHelper: Array<string> = [];
      let dirHelperCounter: Array<number> = [];

      // Get all files recursively
      while (waitingList.length !== 0) {
        let record = waitingList.pop();

        if (dirHelperCounter.length > 0) {
          if (dirHelperCounter[dirHelperCounter.length - 1] > 0) {
            dirHelperCounter[dirHelperCounter.length - 1] -= 1;
          }
        }

        if (record === undefined){
        } else if (record.isFile()) {
          fileList.push(getAbsPath(record.name, iPath, ...dirHelper));
        } else if (record.isDirectory()) {
          let subDir: Array<Dirent> =
            await fs.readdir(getAbsPath(record.name, iPath, ...dirHelper), {withFileTypes: true});

          dirHelper.push(record.name);
          dirHelperCounter.push(subDir.length);
          waitingList.push(...subDir);
        } else {
          errorAndExit('Unhandled path type');
        }

        if (dirHelperCounter.length > 0) {
          while (dirHelperCounter[dirHelperCounter.length - 1] === 0) {
            dirHelper.pop();
            dirHelperCounter.pop();
          }
        }
      }
    } else {
      errorAndExit('Unhandled path type');
    }
  } catch (e: any) {
    if (e.errno === -4058) {                // code === 'ENOENT'
      errorAndExit(`No such file or directory at ${e.path}`);
    } else {
      errorAndExit(`Unknown error with errno=${e.errno} and code=${e.code}`)
    }
  }

  fileList = filterCaredFiles(fileList);

  verbose(`Resolved file list contains ${fileList.length} record(s)`, fileList);

  return fileList;
}

const filterCaredFiles = (fileList: Array<string>): Array<string> => {
  return fileList.filter(record => {
    return ['.js', '.jsx', '.ts', '.tsx'].indexOf(path.extname(record)) >= 0;
  })
}

export const getFileContent = async (absPath: string): Promise<string> => {
  return await fs.readFile(absPath, 'utf-8');
}
