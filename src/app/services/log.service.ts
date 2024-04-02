export class LogService {
    log = (message: string) => {
        console.log(`%cLog%c ${message}`, 'background: black; color: #FFF;', 'font-weight: bold');
    }

    error = (message: string) => {
        console.log(`%cError%c ${message}`, 'background: red; color: #FFF;', 'font-weight: bold');
    }

    success = (message: string) => {
        console.log(`%cSuccess%c ${message}`, 'background: green; color: #FFF;', 'font-weight: bold');
    }

    warn = (message: string) => {
        console.log(`%cWarn%c ${message}`, 'background: yellow; color: #000;', 'font-weight: bold');
    }
}
