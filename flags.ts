import { flag } from 'flags/next';
import { cookies } from 'next/headers';


export const privatePageFlag = flag({
    key: 'private',
    decide: async () => {
        if (process.env.NODE_ENV === 'production') {
            const c = await cookies()
            return c.getAll().find(cookie => cookie.name === 'private')?.value === 'true';
        }
        return process.env.PRIVATE_PAGE_FLAG === 'true' ? true : false;
    }
});