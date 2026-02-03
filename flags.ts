import { flag } from 'flags/next';
import { cookies } from 'next/headers';


export const privatePageFlag = flag({
    key: 'private',
    decide: async () => {
        // Check for private access cookie
        const c = await cookies();
        const hasPrivateAccess = c.get('private_access')?.value === 'true';

        // Allow access if cookie is set OR if environment flag is true
        return hasPrivateAccess || process.env.PRIVATE_PAGE_FLAG === 'true';
    }
});


// javascript: (function () {
//     document.cookie = "private_access=true; path=/; max-age=36000";
//     alert(document.cookie);
// })();