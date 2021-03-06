//
//  FMULConfigJsonParser.m
//
//  Created by Nikolay Demyankov on 29.01.17.
//

#import "FMULConfigJsonParser.h"

@implementation FMULConfigJsonParser

+ (NSArray<FMULHost*>*)parseConfig:(NSString*)pathToJsonConfig {
	NSData* ulData = [NSData dataWithContentsOfFile:pathToJsonConfig];
	if (!ulData) {
		return nil;
	}

	NSError* error = nil;
	NSArray* jsonObject = [NSJSONSerialization JSONObjectWithData:ulData options:kNilOptions error:&error];
	if (error) {
		return nil;
	}

	NSMutableArray<FMULHost*>* preferences = [[NSMutableArray alloc] init];
	for (NSDictionary* jsonEntry in jsonObject) {
		FMULHost* host = [[FMULHost alloc] initWithHostName:jsonEntry[@"host"]
													scheme:jsonEntry[@"scheme"]
													event:jsonEntry[@"event"]];
		NSArray<FMULPath*>* paths = [self parsePathsFromJson:jsonEntry[@"path"] forHost:host];
		[host addAllPaths:paths];

		[preferences addObject:host];
	}

	return preferences;
}

+ (NSArray<FMULPath*>*)parsePathsFromJson:(NSArray*)jsonArray forHost:(FMULHost*)host {
	if (!jsonArray || !jsonArray.count) {
		return nil;
	}

	NSMutableArray<FMULPath*>* paths = [[NSMutableArray alloc] initWithCapacity:jsonArray.count];
	for (NSDictionary* entry in jsonArray) {
		NSString* urlPath = entry[@"url"];
		NSString* pathEvent = entry[@"event"] ? entry[@"event"] : host.event;

		// ignore '*' paths; we don't need them here
		if ([urlPath isEqualToString:@"*"] || [urlPath isEqualToString:@".*"]) {
			continue;
		}

		// create path entry
		FMULPath *path = [[FMULPath alloc] initWithUrlPath:urlPath andEvent:pathEvent];
		[paths addObject:path];
	}

	return paths;
}

@end
