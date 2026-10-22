// Raises every CocoaPods target to the app's minimum iOS version.
// Some dependencies (e.g. AsyncStorage, ReachabilitySwift) still declare
// iOS 12-13, which Xcode 27+ refuses to build ("deployment target ... is
// set to 13.4, but the range of supported ... is 15.0 to 27.x").
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const MIN_IOS = '16.4'; // Expo SDK 58's minimum
const MARKER = '# withPodsDeploymentTarget';

module.exports = function withPodsDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(MARKER)) {
        contents = contents.replace(
          // After react_native_post_install, so nothing resets it.
          /(post_install do \|installer\|[\s\S]*?react_native_post_install\([\s\S]*?\n {4}\)\n)/,
          (match) =>
            match +
            `    ${MARKER}\n` +
            `    installer.pods_project.targets.each do |target|\n` +
            `      target.build_configurations.each do |build_config|\n` +
            `        if build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ${MIN_IOS}\n` +
            `          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MIN_IOS}'\n` +
            `        end\n` +
            `      end\n` +
            `    end\n`
        );
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
};
