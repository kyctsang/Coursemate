import * as Colors from './colors'

export const base = {
    flex: 1,
    backgroundColor: Colors.background
};

export const auth = {
    ...base,
    paddingTop: 100,
    paddingHorizontal: 12
};

export const page = {
    ...base,
    paddingTop: 20,
    paddingHorizontal: 12
};
