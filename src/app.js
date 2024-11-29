import express from 'express';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import LogMiddleware from './middlewares/log.middleware.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import UsersRouter from './routes/users.router.js';
import CharaterRouter from './routes/charater.router.js';
import ItemRouter from './routes/item.router.js';

const app = express();
const PORT = 3020;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(
    expressSession({
        secret: 'customized-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 30,
        },
    }),
);
app.use('/api', [UsersRouter, CharaterRouter, ItemRouter]);
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});