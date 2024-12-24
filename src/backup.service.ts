import { Injectable } from "@nestjs/common";
import * as cron from 'node-cron';
import {exec} from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { AppConfig } from './config/app.config';

@Injectable()
export class BackupService{

    private backupDir: string;

    constructor() {
        this.backupDir = '/tmp';
        this.ensureBackupDirectory();
        this.scheduleDailyBackup();
    }

    private ensureBackupDirectory(){
        if(!fs.existsSync(this.backupDir)){
            fs.mkdirSync(this.backupDir, {recursive: true});
        }
    }

    private scheduleDailyBackup(){
        cron.schedule('0 0 * * *', () => {
            this.createBackup();
        })
    }

    private createBackup(){
        const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');

        const outputDir = path.join(this.backupDir, `mongo_backup_${timeStamp}`);

        const mongoUri = AppConfig.mongoUri;

        const command = `mongodump --uri="${mongoUri}" --out="${outputDir}"`;

        exec(command, (error: any, stdout: any, stderr: any) => {
            if(error){
                console.error(`Backup failed: ${error.message}`)
                return;
            }
            if(stderr){
                console.warn(`Backup warning: ${stderr}`);
            }
            console.log('Backup successful');
        });
    }
}