import { IUserInfo } from "../client/user";
import { Debug } from "../debug/debug";
import { IPacketData_SignInResult } from "../network/packet";
import { LoginScene } from "../scenes/loginScene";


export class Auth {
    private static _gapi: any;
    private static _onSignInCallback?: (signedIn: boolean, id?: string) => void;
    private static _onSignOutCallback?: () => void;
    private static _userInfo?: IUserInfo;

    public static init(callback: () => void) {
        if(this._gapi != undefined) {
            callback();
            return;
        }

        this._gapi = window['gapi'];

        let initialized = false;

        window['Auth'] = Auth;

        this._gapi.load('auth2', () => {

            //Auth.signOut()

            const auth2 = this._gapi.auth2.init({
                client_id: '959981766504-9m4sm16bkc2572ki2umr4r86rmvpecdu.apps.googleusercontent.com',
                scope: 'profile'
            });

            //var signedIn = auth2.isSignedIn.get();
            
            auth2.isSignedIn.listen((signedIn) => {

                if (signedIn) {
                    var currentUser = auth2.currentUser.get();
    
                    var authResponse = currentUser.getAuthResponse();
                    if (Debug.consoleLog) console.log('authResponse', authResponse);
                    //Get Token from authResponse
                    
                    var basicProfile = currentUser.getBasicProfile();
                    if (Debug.consoleLog) console.log('basicProfile', basicProfile);
                    //Get Email, Name, etc. from basicProfile
    
                    //btnGoogleLogin.html("Logged in: <b>" + basicProfile.getName() + "</b>");
                    //Post the details to your back-end with ajax or whatever you use
                    //Redirect the user
                } else {
                    //btnGoogleLogin.html("Login with Google");
                }

                
            

            });

            // Listen for changes to current user.
            auth2.currentUser.listen((a, b, c) => {
                if (Debug.consoleLog) console.log("user changed", a, b, c)

                

                const isSignedIn = this.getIsSignedIn()

                if(isSignedIn) {
                    if (Debug.consoleLog) console.log("signed in")

                    const basicProfile = this.getGoogleBasicProfile();
                    const name = basicProfile.getName();
                    const id = basicProfile.getId();

                    if (Debug.consoleLog) console.log(`as ${name} (${id})`)

                    if(this._onSignInCallback) {
                        this._onSignInCallback(true, id);
                        this._onSignInCallback = undefined;
                    }


                } else {
                    if (Debug.consoleLog) console.log("signed out")

                    if(this._onSignOutCallback) {
                        this._onSignOutCallback();
                        this._onSignOutCallback = undefined;
                    }
                }

                if(!initialized) {
                    initialized = true;
                    callback();
                }
            });

            

        });
    }
    
    public static getIsSignedIn() {
        return Auth._gapi.auth2.getAuthInstance().isSignedIn.get() as boolean;
    }

    public static getUserInfo() {
        return this._userInfo!;
    }

    public static getGoogleBasicProfile() {
        return Auth._gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    }

    public static getGoogleBasicProfileId() {
        return this.getGoogleBasicProfile().getId();
    }
    

    public static googleSignIn(callback: (signedIn: boolean, id?: string) => void) {
        this._onSignInCallback = callback;
        this._gapi.auth2.getAuthInstance().signIn();

    }

    public static signOut(callback: () => void) {
        if(!this.getIsSignedIn()) {
            callback();
            return;
        }

        this._onSignOutCallback = callback;
        this._gapi.auth2.getAuthInstance().signOut();
        
    }

    public static onReceiveSignInResult(data: IPacketData_SignInResult) {
        this._userInfo = data.userInfo;

        if(LoginScene.Instance) {
            LoginScene.Instance.onReceiveSignInResult(data);
        }
    }
}