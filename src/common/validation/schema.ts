import {object, string, regex, toTrimmed, minLength, maxLength,
        toCustom, pick, number} from 'valibot';

export const NameSchema = string('nume is required',[
    toTrimmed(),
    minLength(4, 'nume are min 4 caractere'),
    maxLength(10, 'nume are max 10 caractere'),
])

export const PassSchema =  string('pass is required', [
    toCustom((input) => atob(input)),
    toTrimmed(),
    minLength(4, 'parola are min 4 caractere'),
    maxLength(10, 'parola are max 10 caractere')
])

const schema  = object({
        name: NameSchema,
        pass: PassSchema,
        id: number('Id is required'),
})
// type LoginPayload = Output<typeof schema>;

export const loginSchema = object({
    body: pick(schema, ['name', 'pass'])
}, 'Body is required')

export const getSelfSchema = object({
    body: pick(schema, ['id', 'name'])
})

export const getCheckUser = object({
    query: object({
        name: string([
            toTrimmed(),
            minLength(4, 'nume are min 4 caractere'),
            maxLength(10, 'nume are max 10 caractere'),
        ])
    })
})

const CustomDate = string('Data invalida', [
    toCustom((input) => atob(input)),
    regex(/^[0-9]{1,2}\s[a-zA-Z]{1,3}\s[0-9]{4}$/, 'Data invalida'),
])

export const postWithDate = object({
    body: object({
        date: CustomDate,
    })
})

export const postDateTable = object({
    body: object({
        date: CustomDate,
        table: number('Lipseste masa'),
    })
})

export const postDateUser = object({
    query: object({
        date: CustomDate,
        table: string('Lipseste invitatul', [toTrimmed(), minLength(4), maxLength(10)]),
    })
})
