import { contextBridge, ipcRenderer } from 'electron'
import os from 'os'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import unzipper from 'unzipper'
import { Encryptor } from './../../../encryptor'
import { AppAPI } from './types'

const homeDir = os.homedir()
const appDir = path.join(homeDir, '.ps')
const pathDB = path.join(appDir, 'ps.db')
const pathAuth = path.join(appDir, 'us.a')
const pathImages = path.join(appDir, 'ps-images')

const appAPI: AppAPI = {
  // eslint-disable-next-line no-async-promise-executor
  createBackup: () => new Promise(async resolve => {
    const pathZip = ipcRenderer.sendSync('open-save-dialog', [{ name: 'Comprimido', extensions: ['zip'] }])
    if (pathZip) {
      const output = fs.createWriteStream(pathZip)
      const archive = archiver('zip')
      output.on('close', function () {
        console.log(archive.pointer() + ' bytes en total!')
        console.log('El archivador se ha finalizado y el descriptor del archivo de salida se ha cerrado.')
        resolve()
      })
      output.on('end', function () {
        console.log('Los datos han sido drenados')
      })
      archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
          console.warn(err)
        } else {
          throw err;
        }
      })
      archive.on('error', function (err) {
        throw err
      })
      archive.pipe(output)
      archive.file(pathDB, { name: 'ps.db' })
      archive.file(pathAuth, { name: 'us.a' })
      for (const img of fs.readdirSync(pathImages)) {
        archive.file(path.join(pathImages, img), { name: 'ps-images/' + img })
      }
      archive.finalize()
    } else {
      resolve()
    }
  }),
  restoreBackup: async () => {
    const dirExtract = path.join(appDir, 'temp')
    const pathZip = ipcRenderer.sendSync('open-open-dialog', [{ name: 'Comprimido', extensions: ['zip'] }])
    if (pathZip) {
      await unzipper.Open.file(pathZip)
        .then(d => d.extract({ path: dirExtract, concurrency: 5 }))
      const tempPathDB = path.join(dirExtract, 'ps.db')
      if (!fs.existsSync(tempPathDB)) {
        throw new Error('El archivo de respaldo es inválido!')
      }
      const tempPathAuth = path.join(dirExtract, 'us.a')
      if (!fs.existsSync(tempPathAuth)) {
        throw new Error('El archivo de respaldo es inválido!')
      }
      fs.unlinkSync(pathAuth)
      fs.unlinkSync(pathDB)
      fs.copyFileSync(tempPathAuth, pathAuth)
      fs.copyFileSync(tempPathDB, pathDB)
      fs.rmSync(pathImages, { recursive: true, force: true })
      const tempPathImages = path.join(dirExtract, 'ps-images')
      if (fs.existsSync(tempPathImages)) {
        fs.cpSync(tempPathImages, pathImages, { recursive: true, force: true })  
      }
      fs.rmSync(dirExtract, { recursive: true, force: true })
    }
  },
  changeCredentials: (userName, password) => {
    fs.writeFileSync(pathAuth, Encryptor.encode(userName, password), { encoding: 'utf8' })
  }
}
contextBridge.exposeInMainWorld('app', appAPI)