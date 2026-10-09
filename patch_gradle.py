import re,sys
p='android/app/build.gradle'
s=open(p).read()
if 'signingConfigs.release' not in s:
    sc='''    signingConfigs {
        release {
            storeFile file("../../protocol-sakha.keystore")
            storePassword "sakha2026"
            keyAlias "sakha"
            keyPassword "sakha2026"
        }
    }
    buildTypes {'''
    s=s.replace('buildTypes {',sc,1)
    i=s.index('buildTypes {')
    j=s.index('release {',i)+len('release {')
    s=s[:j]+'\n            signingConfig signingConfigs.release'+s[j:]
    open(p,'w').write(s)
print('patched')

