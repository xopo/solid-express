import {object, string, regex, toTrimmed, minLength, maxLength,
        toCustom, pick, number, url} from 'valibot';

export const NameSchema = string('Name is required',[
    toTrimmed(),
    minLength(4, 'Name are min 4 caractere'),
    maxLength(10, 'Name are max 10 caractere'),
])

export const PassSchema =  string('pass is required', [
    toCustom((input) => atob(input)),
    toTrimmed(),
    minLength(4, 'parola are min 4 caractere'),
    maxLength(10, 'parola are max 10 caractere')
])

export const UriSchema = url('Url incorect');

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
            minLength(4, 'Name are min 4 caractere'),
            maxLength(10, 'Name are max 10 caractere'),
        ])
    })
})

const CustomDate = string('Data invalida', [
    toCustom((input) => atob(input)),
    regex(/^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-][01]\d:[0-5]\d)$/, 'Data invalida'),
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
