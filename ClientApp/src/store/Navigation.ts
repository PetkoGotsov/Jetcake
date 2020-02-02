import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NavigationState {
    authenticated: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface ChangeAuthenticated {
    type: 'CHANGE_AUTHENTICATED';
    authenticated: boolean;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = ChangeAuthenticated;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    changeAuthenticated: (authenticated): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.navigation && authenticated !== appState.navigation.authenticated) {
            dispatch({ type: 'CHANGE_AUTHENTICATED', authenticated: authenticated });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: NavigationState = { authenticated:false };

export const reducer: Reducer<NavigationState> = (state: NavigationState | undefined, incomingAction: Action): NavigationState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'CHANGE_AUTHENTICATED':
            return {
                authenticated: action.authenticated
            };
        default:
            return state;
    }
};
